import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import type {
  RawShaderMaterial,
  ShaderMaterial,
  WebGLRenderTarget,
} from "three";
import { Mesh, Scene } from "three";
import { quadGeometry, quadCamera } from "@/registry/webgl/lib/quads";
import { saveGlState } from "@/registry/webgl/lib/save-gl-state";

/**
 * Options for the useQuadShader hook.
 */
export interface UseQuadShaderOptions {
  /**
   * The ShaderMaterial or RawShaderMaterial to be applied to the quad.
   */
  program: ShaderMaterial | RawShaderMaterial;
  /**
   * The WebGLRenderTarget or its ref to render to, or null to render to screen.
   */
  renderTarget: WebGLRenderTarget | RefObject<WebGLRenderTarget | null> | null;
  /**
   * Optional callback to run before rendering the quad.
   */
  beforeRender?: (state: RootState, delta: number) => void;
  /**
   * Optional callback to run after rendering the quad.
   */
  afterRender?: (state: RootState, delta: number) => void;
  /**
   * Whether the quad should automatically render each frame. Defaults to true.
   */
  autoRender?: boolean;
  /**
   * Priority of the render callback in the render loop.
   */
  priority?: number;
}

/**
 * API returned by useQuadShader for manual rendering control.
 */
export interface QuadShaderApi {
  /**
   * Manually render the quad shader. Use this when autoRender is false.
   * @param delta - The time delta since the last frame.
   */
  render: (delta: number) => void;
}

/**
 * Hook for rendering a fullscreen quad with a ShaderMaterial, optionally to a render target.
 * This is commonly used for postprocessing or rendering effects to a texture.
 *
 * @example
 * // Auto-render mode (default)
 * useQuadShader({ program: material, renderTarget: fbo });
 *
 * @example
 * // Manual render mode
 * const api = useQuadShader({
 *   program: material,
 *   renderTarget: null,
 *   autoRender: false
 * });
 *
 * useFrame((_, delta) => {
 *   api.render(delta);
 * });
 */
export function useQuadShader(options: UseQuadShaderOptions): QuadShaderApi {
  const {
    program,
    renderTarget,
    beforeRender,
    afterRender,
    autoRender = true,
    priority = 0,
  } = options;

  const state = useThree();
  const containerScene = useMemo(() => new Scene(), []);
  const meshRef = useRef<Mesh | null>(null);

  // Setup mesh in the scene
  useEffect(() => {
    const mesh = new Mesh(quadGeometry, program);
    meshRef.current = mesh;
    containerScene.add(mesh);

    return () => {
      containerScene.remove(mesh);
      meshRef.current = null;
    };
  }, [containerScene, program]);

  const beforeRenderRef = useRef(beforeRender);
  // eslint-disable-next-line react-hooks/refs
  beforeRenderRef.current = beforeRender;

  const afterRenderRef = useRef(afterRender);
  // eslint-disable-next-line react-hooks/refs
  afterRenderRef.current = afterRender;

  const renderTargetRef = useRef(renderTarget);
  // eslint-disable-next-line react-hooks/refs
  renderTargetRef.current = renderTarget;

  // Core render function
  const renderQuad = useCallback(
    (delta: number) => {
      const restoreGlState = saveGlState(state);

      if (beforeRenderRef.current) {
        beforeRenderRef.current(state, delta);
      }

      // Set render target
      if (!renderTargetRef.current) {
        state.gl.setRenderTarget(null);
      } else if ("current" in renderTargetRef.current) {
        state.gl.setRenderTarget(renderTargetRef.current.current);
      } else {
        state.gl.setRenderTarget(renderTargetRef.current);
      }

      state.gl.clear(true, true);
      state.gl.render(containerScene, quadCamera);

      if (afterRenderRef.current) {
        afterRenderRef.current(state, delta);
      }

      restoreGlState();
    },
    [state, containerScene]
  );

  // Auto-render using useFrame when enabled
  useFrame((_, delta) => {
    if (autoRender) {
      renderQuad(delta);
    }
  }, priority);

  // Return API for manual rendering
  const api = useMemo<QuadShaderApi>(
    () => ({
      render: renderQuad,
    }),
    [renderQuad]
  );

  return api;
}
