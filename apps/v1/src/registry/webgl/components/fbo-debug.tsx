import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { folder as levaFolder, useControls } from "leva";
import { useEffect, useMemo } from "react";
import { Group, OrthographicCamera, Texture, WebGLRenderTarget } from "three";
import * as THREE from "three";

import { DoubleFbo } from "@/registry/webgl/lib/double-fbo";
import { useUniforms } from "@/registry/webgl/hooks/use-uniforms";
import { useRawShader } from "@/registry/webgl/hooks/use-raw-shader";
import { saveGlState } from "@/registry/webgl/lib/save-gl-state";

const fragmentShader = /*glsl*/ `#version 300 es
precision highp float;
uniform sampler2D uMap;
in vec2 vUv;
out vec4 fragColor;

void main() {
  fragColor = texture(uMap, vUv);
}
`;

const vertexShader = /*glsl*/ `#version 300 es
in vec3 position;
in vec2 uv;
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

/**
 * Props for the FboDebug component.
 */
export interface FboDebugProps {
  /**
   * Optional configuration for hit testing scale adjustment.
   * When viewing multiple textures in a grid, the scale is adjusted
   * to match the grid layout.
   */
  hitConfig?: {
    scale: number;
  };
  /**
   * Record of named textures to debug.
   * Supports raw Textures, WebGLRenderTargets, or DoubleFbo instances.
   */
  textures: Record<string, Texture | WebGLRenderTarget | DoubleFbo | null>;
  /**
   * The default texture to display. Defaults to "screen".
   * Can be overridden via URL query param `?debugTarget=<name>`.
   */
  defaultTexture?: string;
}

/**
 * Determines the initial texture to display, checking URL query params first.
 * Falls back to the provided default if the query param texture doesn't exist.
 * @internal
 */
function getInitialSelectedTexture(defaultTexture: string, textures: string[]) {
  const query =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("debugTarget") ||
        defaultTexture
      : defaultTexture;

  if (textures.includes(query)) {
    return query;
  }

  return defaultTexture;
}

/**
 * Extracts the underlying Texture from various texture container types.
 * Handles raw Textures, WebGLRenderTargets, and DoubleFbo instances.
 * @internal
 */
function getTexture(
  value: Texture | WebGLRenderTarget | DoubleFbo | null
): Texture | null {
  if (!value) return null;
  if ("texture" in value && typeof value.texture !== "undefined") {
    // DoubleFbo or WebGLRenderTarget
    return value.texture as Texture;
  }
  // Already a Texture
  return value as Texture;
}

/**
 * Debug component for visualizing framebuffer objects (FBOs) and render targets.
 * Provides a Leva-controlled UI to switch between different textures and view
 * them either individually fullscreen or in a grid layout.
 *
 * Useful during development to inspect intermediate render passes, depth buffers,
 * and other off-screen textures.
 *
 * @example
 * // Debug multiple render targets
 * const colorFbo = useFbo({ width: 512, height: 512 });
 * const depthFbo = useFbo({ width: 512, height: 512 });
 *
 * <FboDebug
 *   textures={{
 *     color: colorFbo,
 *     depth: depthFbo,
 *     screen: null, // null shows the main screen
 *   }}
 *   defaultTexture="color"
 * />
 *
 * @example
 * // With DoubleFbo for ping-pong buffers
 * const doubleFbo = useDoubleFbo({ width: 256, height: 256 });
 *
 * <FboDebug
 *   textures={{
 *     simulation: doubleFbo,
 *   }}
 * />
 */
export function FboDebug({
  hitConfig,
  textures,
  defaultTexture = "screen",
}: FboDebugProps) {
  const camera = useMemo(() => new OrthographicCamera(), []);
  const numTextures = Object.keys(textures).length;

  const uniforms = useUniforms(() => ({
    uMap: {
      value: null as Texture | WebGLRenderTarget | DoubleFbo | null,
    },
  }));

  const debugTextureProgram = useRawShader({
    name: "DebugShaderProgram",
    vertexShader,
    fragmentShader,
    glslVersion: THREE.GLSL3,
    uniforms,
  });

  const grid = useMemo(() => {
    const sqrt = Math.sqrt(numTextures);
    const columns = Math.ceil(sqrt);
    const rows = Math.ceil(sqrt);
    const total = columns * rows;

    return {
      columns,
      rows,
      total,
    };
  }, [numTextures]);

  const debugScene = useMemo(() => new Group(), []);

  const { debugTarget } = useControls({
    DebugTextures: levaFolder({
      debugTarget: {
        value: getInitialSelectedTexture(defaultTexture, Object.keys(textures)),
        options: Object.keys(textures).concat("all"),
        onChange: (value) => {
          if (typeof window !== "undefined") {
            window.history.pushState(
              {},
              "",
              window.location.pathname + "?debugTarget=" + value
            );
          }
        },
        transient: false,
      },
    }),
  });

  const size = useThree((state) => state.size);

  const DEFAULT_SCISSOR = {
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
  };

  useEffect(() => {
    return () => {
      if (!hitConfig) return;
      hitConfig.scale = 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    const { gl } = state;

    const resetGl = saveGlState(state);

    gl.autoClear = false;
    gl.setRenderTarget(null);

    gl.setViewport(
      DEFAULT_SCISSOR.x,
      DEFAULT_SCISSOR.y,
      DEFAULT_SCISSOR.width,
      DEFAULT_SCISSOR.height
    );

    gl.setScissor(
      DEFAULT_SCISSOR.x,
      DEFAULT_SCISSOR.y,
      DEFAULT_SCISSOR.width,
      DEFAULT_SCISSOR.height
    );

    const width = size.width;
    const height = size.height;

    const { columns, rows } = grid;

    if (debugTarget !== "all" && debugTarget in textures) {
      if (hitConfig) {
        hitConfig.scale = 1;
      }
      debugTextureProgram.uniforms.uMap.value = getTexture(
        textures[debugTarget]
      );
      gl.render(debugScene, camera);
      resetGl();
      return;
    }

    if (hitConfig) {
      hitConfig.scale = columns;
    }

    for (let i = 0; i < numTextures; i++) {
      const col = i % columns;
      const row = rows - Math.floor(i / columns) - 1;

      const w = width / columns;
      const h = height / rows;
      const x = col * w;
      const y = row * h;

      gl.setViewport(x, y, w, h);

      debugTextureProgram.uniforms.uMap.value = getTexture(
        textures[Object.keys(textures)[i]]
      );

      gl.render(debugScene, camera);
    }

    // reset

    gl.setViewport(
      DEFAULT_SCISSOR.x,
      DEFAULT_SCISSOR.y,
      DEFAULT_SCISSOR.width,
      DEFAULT_SCISSOR.height
    );

    gl.setScissor(
      DEFAULT_SCISSOR.x,
      DEFAULT_SCISSOR.y,
      DEFAULT_SCISSOR.width,
      DEFAULT_SCISSOR.height
    );
    resetGl();
  }, 1);

  return (
    <>
      {createPortal(
        <mesh>
          <planeGeometry args={[2, 2]} />
          <primitive object={debugTextureProgram} />
        </mesh>,
        debugScene
      )}
    </>
  );
}
