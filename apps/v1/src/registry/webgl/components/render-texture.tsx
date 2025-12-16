import type { RootState } from "@react-three/fiber";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import type { DomEvent } from "@react-three/fiber/dist/declarations/src/core/events";
import type { PropsWithChildren, JSX } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { RGBAFormat, Scene } from "three";
import { saveGlState } from "../lib/save-gl-state";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RenderTextureProps {
  /** Debug this texture full screen */
  debug?: boolean;
  /** Whether the render target is active, it will auto-render the scene */
  isPlaying?: boolean;
  /** The width of the render target, only used if you dont provide an fbo */
  width?: number;
  /** The height of the render target, only used if you dont provide an fbo */
  height?: number;
  /** Attach the texture to a THREE.Object3D */
  attach?: string | null;
  /** Callback called when a new mapTexture is used */
  onMapTexture?: (texture: THREE.Texture) => void;
  /** Callback called when a new depthTexture is used */
  onDepthTexture?: (texture: THREE.DepthTexture) => void;
  /** Use a custom render target, this will disable automatic resizing */
  fbo?: THREE.WebGLRenderTarget;
  /** A custom scene to use as a container */
  containerScene?: Scene;
  /** Use global mouse coordinates to calculate raycast */
  useGlobalPointer?: boolean;
  /** Priority of the render frame */
  renderPriority?: number;
  /** Ref to mesh used for raycasting UV compute. If provided, skips r3f tree traversal */
  raycastingMesh?: React.RefObject<THREE.Mesh | null>;
}

const renderTextureContext = createContext<{
  isInsideRenderTexture: boolean;
  isPlaying: boolean;
}>({
  isInsideRenderTexture: false,
  isPlaying: true,
});

renderTextureContext.displayName = "RenderTextureContext";

const useRenderTexture = () => {
  return useContext(renderTextureContext);
};

export type TextureRenderCallback = (params: {
  elapsedTime: number;
  state: RootState;
  delta: number;
  frame?: XRFrame;
}) => void;

const useTextureFrame = (
  callback: TextureRenderCallback,
  priority?: number
) => {
  const { isPlaying } = useRenderTexture();

  const elapsedTimeRef = useRef(0);
  useFrame((state, delta, frame) => {
    if (!isPlaying) return;
    elapsedTimeRef.current += delta;
    callback({
      elapsedTime: elapsedTimeRef.current,
      state,
      delta,
      frame,
    });
  }, priority);
};

export function RenderTexture({
  isPlaying: _playing = true,
  debug,
  width: _w,
  height: _h,
  attach,
  fbo: _fbo,
  onMapTexture,
  onDepthTexture,
  containerScene,
  children,
  useGlobalPointer,
  renderPriority,
  raycastingMesh,
}: PropsWithChildren<RenderTextureProps>): JSX.Element {
  const width = useThree((s) => (typeof _w === "number" ? _w : s.size.width));
  const height = useThree((s) => (typeof _h === "number" ? _h : s.size.height));

  const fbo = useMemo(() => {
    return (
      _fbo ||
      new THREE.WebGLRenderTarget(width, height, {
        samples: 8,
        stencilBuffer: true,
        depthTexture: new THREE.DepthTexture(
          width,
          height,
          THREE.UnsignedInt248Type
        ),
        format: RGBAFormat,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_fbo]);

  useEffect(() => {
    if (onMapTexture) {
      onMapTexture(fbo.texture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fbo.texture]);

  useEffect(() => {
    if (onDepthTexture && fbo.depthTexture) {
      onDepthTexture(fbo.depthTexture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fbo.depthTexture]);

  const portalScene = useMemo(() => {
    return containerScene || new Scene();
  }, [containerScene]);

  const isPlayingRef = useRef(_playing);
  const [isPlaying, setIsPlaying] = useState(_playing);

  const viewportSize = useThree((state) => state.size);
  const viewportSizeRef = useRef(viewportSize);
  viewportSizeRef.current = viewportSize;

  useEffect(() => {
    if (_fbo) {
      setIsPlaying(_playing);
      isPlayingRef.current = _playing;
      // user is providing a custom fbo, we dont want to resize
      return;
    }
    fbo.setSize(width, height);
    const abortController = new AbortController();
    const signal = abortController.signal;

    setIsPlaying(true);
    isPlayingRef.current = true;
    if (_playing) return;
    setTimeout(() => {
      if (signal.aborted) return;
      setIsPlaying(false);
      isPlayingRef.current = false;
    }, 100);

    return () => {
      abortController.abort();
    };
  }, [fbo, _playing, width, height, setIsPlaying, _fbo]);

  /** UV compute function relative to the viewport */
  const viewportUvCompute = useCallback(
    (event: DomEvent, state: RootState) => {
      if (!isPlayingRef.current) return;

      if (!viewportSizeRef.current) return;

      const { width, height, left, top } = viewportSizeRef.current;
      const x = event.clientX - left;
      const y = event.clientY - top;
      state.pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
      state.raycaster.setFromCamera(state.pointer, state.camera);
    },
    [viewportSizeRef, isPlayingRef]
  );

  const objectRef = useRef<Record<string, unknown>>(null);

  /**
   * Traverses the r3f tree to find the closest parent Object3D.
   * Since a texture doesn't have an easy way to obtain the parent,
   * we use r3f internals to find the next Object3D.
   */
  const findClosestParent = useCallback((): THREE.Object3D | null => {
    if (!objectRef.current) return null;
    let parent = (objectRef.current as any)?.__r3f?.parent?.object;
    while (parent && !(parent instanceof THREE.Object3D)) {
      parent = parent?.__r3f?.parent?.object;
    }
    return parent ?? null;
  }, []);

  /** UV compute relative to the parent mesh UV */
  const uvCompute = useCallback(
    (event: DomEvent, state: RootState, previous: RootState) => {
      if (!isPlayingRef.current) return;

      // Determine the mesh to use for raycasting
      const mesh = raycastingMesh
        ? raycastingMesh.current
        : findClosestParent();
      if (!mesh) return;

      // First we call the previous state-onion-layers compute, this is what makes it possible to nest portals
      if (!previous.raycaster.camera) {
        previous.events.compute?.(
          event,
          previous,
          previous.previousRoot?.getState()
        );
      }

      // Check if the mesh is hit, if not there's no need to raycast at all
      const [intersection] = previous.raycaster.intersectObject(mesh);
      if (!intersection) return false;

      // We take that hits uv coords, set up this layers raycaster, et voilà, we have raycasting on arbitrary surfaces
      const uv = intersection.uv;
      if (!uv) return false;
      state.raycaster.setFromCamera(
        state.pointer.set(uv.x * 2 - 1, uv.y * 2 - 1),
        state.camera
      );
    },
    [raycastingMesh, findClosestParent]
  );

  const contextValue = useMemo(
    () => ({ isInsideRenderTexture: true, isPlaying }),
    [isPlaying]
  );

  return (
    <>
      <renderTextureContext.Provider value={contextValue}>
        {createPortal(
          <SceneContainer
            debug={debug}
            fbo={fbo}
            renderPriority={renderPriority}
          >
            {children}
            {/* Without an element that receives pointer events state.pointer will always be 0/0 */}
            <group onPointerOver={(): null => null} />
          </SceneContainer>,

          portalScene as any,
          {
            events: {
              compute: useGlobalPointer
                ? viewportUvCompute
                : (uvCompute as any),
              priority: 0,
            },
          }
        )}
      </renderTextureContext.Provider>
      {attach ? <primitive attach={attach} object={fbo.texture} /> : null}
      {/* Used to get closest mesh */}
      <primitive attach="renderTextureRef" object={{}} ref={objectRef} />
    </>
  );
}

interface SceneContainerProps {
  fbo: THREE.WebGLRenderTarget;
  debug?: boolean;
  renderPriority?: number;
}

function SceneContainer({
  fbo,
  renderPriority,
  debug,
  children,
}: PropsWithChildren<SceneContainerProps>): JSX.Element {
  useTextureFrame(
    ({ state }) => {
      const restore = saveGlState(state);
      state.gl.toneMapping = THREE.NoToneMapping;
      state.gl.toneMappingExposure = 1;
      if (debug) {
        state.gl.setRenderTarget(null);
      } else {
        state.gl.setRenderTarget(fbo);
      }
      state.gl.render(state.scene, state.camera);
      restore();
    },
    debug ? 1000 : renderPriority
  );

  return <>{children}</>;
}
