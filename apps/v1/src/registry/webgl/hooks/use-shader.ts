import { useMemo } from "react";
import { ShaderMaterial, ShaderMaterialParameters } from "three";
import { Defines, useDefines } from "@/registry/webgl/hooks/use-defines";
import type { Uniforms } from "@/registry/webgl/lib/webgl-types";

/**
 * Extended ShaderMaterial with typed uniforms and a setDefine helper.
 * @typeParam U - The uniforms type
 */
type ShaderProgram<U extends Uniforms = Uniforms> = ShaderMaterial & {
  uniforms: U;
  /** Sets a shader define and triggers recompilation */
  setDefine: (name: string, value: string) => void;
};

/**
 * Parameters for creating a ShaderMaterial, with typed uniforms.
 * @typeParam U - The uniforms type
 */
interface ShaderParameters<U extends Uniforms = Uniforms> extends Omit<
  ShaderMaterialParameters,
  "uniforms" | "defines"
> {
  /** Uniform values for the shader */
  uniforms?: U;
}

/**
 * Creates a memoized ShaderMaterial
 *
 * - The defines parameter will react to changes and trigger automatic updates.
 * - Uniforms get typed correctly.
 * - The material is recreated only when vertex or fragment shaders change.
 *
 * @typeParam U - The uniforms type
 * @param parameters - Shader material parameters including shaders and uniforms
 * @param defines - Optional shader defines that react to changes
 * @returns A ShaderProgram (ShaderMaterial with typed uniforms and setDefine)
 *
 * @example
 * const uniforms = useUniforms(() => ({
 *   uTime: { value: 0 },
 *   uColor: { value: new THREE.Color(0xff0000) },
 * }));
 *
 * const defines = {
 *   quality: "LOW"
 * }
 *
 * const material = useShader({
 *   vertexShader,
 *   fragmentShader,
 *   uniforms,
 * }, defines);
 *
 * useFrame(({ clock }) => {
 *   material.uniforms.uTime.value = clock.elapsedTime;
 * });
 */
export function useShader<U extends Uniforms = Uniforms>(
  parameters: ShaderParameters<U>,
  defines: Defines = {}
): ShaderProgram<U> {
  const program = useMemo(() => {
    const p = new ShaderMaterial({
      ...parameters,
    }) as ShaderProgram<U>;

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
