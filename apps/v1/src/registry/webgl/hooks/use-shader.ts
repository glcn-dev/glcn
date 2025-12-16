import { useMemo } from "react";
import { ShaderMaterial, ShaderMaterialParameters } from "three";
import { Defines, useDefines } from "@/registry/webgl/hooks/use-defines";
import type { Uniforms } from "@/registry/webgl/lib/webgl-types";

type ShaderProgram<U extends Uniforms = Uniforms> = ShaderMaterial & {
  uniforms: U;
  setDefine: (name: string, value: string) => void;
};

interface ShaderParameters<U extends Uniforms = Uniforms> extends Omit<
  ShaderMaterialParameters,
  "uniforms" | "defines"
> {
  uniforms?: U;
}

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
