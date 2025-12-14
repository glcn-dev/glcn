/* eslint-disable @typescript-eslint/no-empty-object-type */
import { useMemo } from "react";
import { IUniform, RawShaderMaterial, ShaderMaterialParameters } from "three";
import { Defines, useDefines } from "@/registry/webgl/hooks/use-defines";

type RawShaderProgram<U extends Record<string, IUniform> = {}> = RawShaderMaterial & {
  uniforms: U;
  setDefine: (name: string, value: string) => void;
};

export function useRawShader<U extends Record<string, IUniform> = {}>(
  parameters: Omit<ShaderMaterialParameters, "uniforms"> & U = {} as U,
  defines?: Defines
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

  useDefines(program, defines)

  return program;
}

