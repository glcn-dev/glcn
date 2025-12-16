import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { DoubleFbo } from "@/registry/webgl/lib/double-fbo";

export interface UseDoubleFboParams extends THREE.RenderTargetOptions {
  width?: number;
  height?: number;
}

export function useDoubleFbo({ width, height, ...params }: UseDoubleFboParams) {
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
    return new DoubleFbo(w, h, params);
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
