import { forwardRef, useImperativeHandle } from "react";
import type { RenderCallback } from "@react-three/fiber";
import {
  useQuadShader,
  type QuadShaderApi,
  type UseQuadShaderOptions,
} from "@/registry/webgl/hooks/use-quad-shader";
import { quadGeometry } from "@/registry/webgl/lib/quads";

/**
 * Props for the QuadShader component, which renders a fullscreen quad mesh with a given ShaderMaterial.
 */
export type QuadShaderProps = UseQuadShaderOptions;

/**
 * Renders a fullscreen quad mesh with the provided ShaderMaterial, optionally to a render target.
 * This is commonly used for postprocessing or rendering effects to a texture.
 *
 * Use a ref to access the QuadShaderApi for manual rendering control when autoRender is false.
 */
export const QuadShader = forwardRef<QuadShaderApi, QuadShaderProps>(
  function QuadShader(
    { program, renderTarget, beforeRender, afterRender, autoRender, priority },
    ref
  ) {
    const api = useQuadShader({
      program,
      renderTarget,
      beforeRender,
      afterRender,
      autoRender,
      priority,
    });

    useImperativeHandle(ref, () => api, [api]);

    return null;
  }
);

export type { QuadShaderApi };

export function QuadMesh({ children }: { children: React.ReactNode }) {
  return <mesh geometry={quadGeometry}>{children}</mesh>;
}
