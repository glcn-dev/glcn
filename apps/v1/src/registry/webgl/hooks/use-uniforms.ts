import { useMemo } from "react";
import * as THREE from "three";

/**
 * Creates a memoized uniforms object for use with shader materials.
 * Ensures the uniforms object reference is stable across re-renders,
 * preventing unnecessary shader recompilations.
 *
 * Accepts either a uniforms object or a factory function.
 * Using a factory function is recommended to avoid creating new objects on every render.
 *
 * @typeParam T - The uniforms record type
 * @param uniforms - A uniforms object or factory function returning uniforms
 * @returns The memoized uniforms object
 *
 * @example
 * const [color, setColor] = useState('red')
 *
 * // Using a factory function (recommended)
 * const uniforms = useUniforms(() => ({
 *   uTime: { value: 0 },
 *   uColor: { value: new THREE.Color(color) }
 *   uResolution: { value: new THREE.Vector2() },
 *   uTexture: { value: null as THREE.Texture | null },
 * }));
 *
 * // Make a uniform react to a state change
 * uniforms.uColor.value.set(color)
 *
 * // Update uniform values on each frame
 * useFrame(({ clock, size }) => {
 *   uniforms.uTime.value = clock.elapsedTime;
 *   uniforms.uResolution.value.set(size.width, size.height);
 * });
 */
export function useUniforms<T extends Record<string, THREE.IUniform>>(
  uniforms: T | (() => T)
) {
  return useMemo<T>(() => {
    if (typeof uniforms === "function") {
      return uniforms();
    }
    return uniforms;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
