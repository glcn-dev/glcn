import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";

/**
 * Parameters for the useFbo hook.
 * Extends THREE.RenderTargetOptions with optional width and height.
 */
export interface UseFboParams extends THREE.RenderTargetOptions {
  /** Width of the render target. Defaults to viewport width if not specified. */
  width?: number;
  /** Height of the render target. Defaults to viewport height if not specified. */
  height?: number;
}

/**
 * Creates a WebGLRenderTarget (FBO) with automatic resizing.
 * Useful for off-screen rendering, post-processing, and render-to-texture effects.
 *
 * The render target automatically resizes when width/height change.
 * If no dimensions are provided, it matches the viewport size.
 *
 * @typeParam TTexture - The texture type for the render target
 * @param params - Configuration options including width, height, and render target options
 * @returns A THREE.WebGLRenderTarget instance
 *
 * @example
 * // Basic usage - matches viewport size
 * const fbo = useFbo({});
 *
 * useFrame(({ gl, scene, camera }) => {
 *   gl.setRenderTarget(fbo);
 *   gl.render(scene, camera);
 *   gl.setRenderTarget(null);
 * });
 *
 * @example
 * // Fixed size with custom options
 * const fbo = useFbo({
 *   width: 1024,
 *   height: 1024,
 *   samples: 4,
 *   depthBuffer: true,
 * });
 */
export function useFbo<
  TTexture extends THREE.Texture | THREE.Texture[] = THREE.Texture,
>({
  width,
  height,
  ...params
}: UseFboParams): THREE.WebGLRenderTarget<TTexture> {
  const w = useThree((s) => {
    if (typeof width === "number") {
      return width;
    }
    return s.size.width;
  });

  const h = useThree((s) => {
    if (typeof height === "number") {
      return height;
    }
    return s.size.height;
  });

  const fbo = useMemo(() => {
    return new THREE.WebGLRenderTarget<TTexture>(w, h, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fbo.setSize(w, h);
  }, [fbo, w, h]);

  return fbo;
}
