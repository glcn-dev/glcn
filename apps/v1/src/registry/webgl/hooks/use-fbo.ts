import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";

export interface UseFboParams extends THREE.RenderTargetOptions {
  width?: number;
  height?: number;
}

export function useFbo({ width, height, ...params }: UseFboParams) {
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
    return new THREE.WebGLRenderTarget(w, h, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fbo.setSize(h, h);
  }, [fbo, w, h]);

  return fbo;
}
