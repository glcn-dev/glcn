import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { DoubleFbo } from "@/registry/webgl/lib/double-fbo";

/**
 * Parameters for the useDoubleFbo hook.
 * Extends THREE.RenderTargetOptions with optional width and height.
 */
export interface UseDoubleFboParams extends THREE.RenderTargetOptions {
  /** Width of the render targets. Defaults to viewport width if not specified. */
  width?: number;
  /** Height of the render targets. Defaults to viewport height if not specified. */
  height?: number;
}

/**
 * Creates a double-buffered FBO (ping-pong buffer) for GPU computations.
 * Useful for simulations, particle systems, or any effect that needs to
 * read from the previous frame while writing to the current frame.
 *
 * Automatically resizes when dimensions change and disposes on unmount.
 *
 * @typeParam TTexture - The texture type for the render targets
 * @param params - Configuration options including width, height, and render target options
 * @returns A DoubleFbo instance with swap(), read, and write properties
 *
 * @example
 * // Basic usage for a simulation
 * const doubleFbo = useDoubleFbo({ width: 512, height: 512 });
 *
 * useFrame(() => {
 *   // Read from previous frame
 *   material.uniforms.uPrevious.value = doubleFbo.read.texture;
 *   // Render to current frame
 *   gl.setRenderTarget(doubleFbo.write);
 *   gl.render(scene, camera);
 *   // Swap buffers
 *   doubleFbo.swap();
 * });
 *
 * @example
 * // With custom render target options
 * const doubleFbo = useDoubleFbo({
 *   width: 256,
 *   height: 256,
 *   minFilter: THREE.NearestFilter,
 *   magFilter: THREE.NearestFilter,
 *   type: THREE.FloatType,
 * });
 */
export function useDoubleFbo<
  TTexture extends THREE.Texture | THREE.Texture[] = THREE.Texture,
>({ width, height, ...params }: UseDoubleFboParams) {
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

  const doubleFbo = useMemo(() => {
    return new DoubleFbo<TTexture>(w, h, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    doubleFbo.setSize(w, h);
  }, [doubleFbo, w, h]);

  useEffect(() => {
    return () => {
      doubleFbo.dispose();
    };
  }, [doubleFbo]);

  return doubleFbo;
}
