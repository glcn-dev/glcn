import { useMemo } from "react";
import { RawShaderMaterial, ShaderMaterialParameters } from "three";
import { Defines, useDefines } from "@/registry/webgl/hooks/use-defines";
import type { Uniforms } from "@/registry/webgl/lib/webgl-types";

type RawShaderProgram<U extends Uniforms> = RawShaderMaterial & {
  uniforms: U;
  setDefine: (name: string, value: string) => void;
};

interface RawShaderParameters<U extends Uniforms> extends Omit<
  ShaderMaterialParameters,
  "uniforms" | "defines"
> {
  uniforms?: U;
}

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
