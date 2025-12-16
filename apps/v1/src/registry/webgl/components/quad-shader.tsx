import { forwardRef, useImperativeHandle } from "react";
import {
  useQuadShader,
  type QuadShaderApi,
  type UseQuadShaderOptions,
} from "@/registry/webgl/hooks/use-quad-shader";
import { quadGeometry } from "@/registry/webgl/lib/quads";

/**
 * Props for the QuadShader component, which renders a fullscreen quad mesh with a given ShaderMaterial.
 */
export interface QuadShaderProps extends UseQuadShaderOptions {
  attach?: string;
}

/**
 * Renders a fullscreen quad mesh with the provided ShaderMaterial, optionally to a render target.
 * This is commonly used for postprocessing or rendering effects to a texture.
 *
 * Use a ref to access the QuadShaderApi for manual rendering control when autoRender is false.
 *
 * @example
 * // Auto-render to a render target and attach its texture to a mesh
 * const fbo = useFbo({
 *   width: 512,
 *   height: 512
 * });
 *
 * <mesh>
 *   <planeGeometry />
 *   <meshBasicMaterial>
 *     <QuadShader program={shaderMaterial} renderTarget={fbo} attach="map" />
 *   </meshBasicMaterial>
 * </mesh>
 *
 * @example
 * // Manual render control with imperative ref
 * const quadRef = useRef<QuadShaderApi>(null);
 *
 * useFrame((_, delta) => {
 *   // Custom render timing
 *   quadRef.current?.render(delta);
 * });
 *
 * <QuadShader
 *   ref={quadRef}
 *   program={shaderMaterial}
 *   renderTarget={null}
 *   autoRender={false}
 * />
 */
export const QuadShader = forwardRef<QuadShaderApi, QuadShaderProps>(
  function QuadShader(
    {
      program,
      renderTarget,
      beforeRender,
      afterRender,
      autoRender,
      priority,
      attach,
    },
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

    const rt =
      renderTarget && "current" in renderTarget
        ? renderTarget.current
        : renderTarget;

    return (
      <>
        {attach && rt ? (
          <primitive attach={attach} object={rt.texture} />
        ) : null}
      </>
    );
  }
);

export type { QuadShaderApi };

export function QuadMesh({ children }: { children: React.ReactNode }) {
  return <mesh geometry={quadGeometry}>{children}</mesh>;
}
