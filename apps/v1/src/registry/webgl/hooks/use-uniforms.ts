import { useMemo } from "react";
import * as THREE from "three";

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
