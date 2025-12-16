import { useMemo } from "react";
import { RawShaderMaterial, ShaderMaterialParameters } from "three";
import { Defines, useDefines } from "@/registry/webgl/hooks/use-defines";
import type { Uniforms } from "@/registry/webgl/lib/webgl-types";

/**
 * Extended RawShaderMaterial with typed uniforms and a setDefine helper.
 * @typeParam U - The uniforms type
 */
type RawShaderProgram<U extends Uniforms> = RawShaderMaterial & {
  uniforms: U;
  /** Sets a shader define and triggers recompilation */
  setDefine: (name: string, value: string) => void;
};

/**
 * Parameters for creating a RawShaderMaterial, with typed uniforms.
 * @typeParam U - The uniforms type
 */
interface RawShaderParameters<U extends Uniforms> extends Omit<
  ShaderMaterialParameters,
  "uniforms" | "defines"
> {
  /** Uniform values for the shader */
  uniforms?: U;
}

/**
 * Creates a memoized RawShaderMaterial with typed uniforms and reactive defines.
 * Unlike useShader, this uses RawShaderMaterial which does not prepend
 * built-in uniforms/attributes - you must declare everything in your shader code.
 *
 * Ideal for GLSL ES 3.0 shaders or when you need full control over the shader source.
 *
 * - The defines parameter will react to changes and trigger automatic updates.
 * - Uniforms get typed correctly.
 * - The material is recreated only when vertex or fragment shaders change.
 *
 * @typeParam U - The uniforms type
 * @param parameters - Shader material parameters including shaders and uniforms
 * @param defines - Optional shader defines that react to changes
 * @returns A RawShaderProgram (RawShaderMaterial with typed uniforms and setDefine)
 *
 * @example
 * const uniforms = useUniforms(() => ({
 *   uMap: { value: null as THREE.Texture | null },
 * }));
 *
 * const defines = {
 *   quality: "MEDIUM"
 * }
 *
 * const material = useRawShader({
 *   vertexShader: `
 *     in vec3 position;
 *     void main() { gl_Position = vec4(position, 1.0); }
 *   `,
 *   fragmentShader: `
 *     precision highp float;
 *     out vec4 fragColor;
 *     void main() { fragColor = vec4(1.0, 0.0, 0.0, 1.0); }
 *   `,
 *   uniforms,
 *   glslVersion: THREE.GLSL3,
 * }, defines);
 *
 * material.unifoms.uMap.value // typed as Texture | null
 */
export function useRawShader<U extends Uniforms = Uniforms>(
  parameters: RawShaderParameters<U>,
  defines: Defines = {}
): RawShaderProgram<U> {
  const program = useMemo(() => {
    const p = new RawShaderMaterial({
      ...parameters,
    }) as RawShaderProgram<U>;

    p.setDefine = (name, value) => {
      p.defines[name] = value;
      p.needsUpdate = true;
    };

    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameters.vertexShader, parameters.fragmentShader]);

  useDefines(program, defines);

  return program;
}
