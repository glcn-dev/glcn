/* eslint-disable @typescript-eslint/no-empty-object-type */
import { useMemo } from "react";
import { IUniform, ShaderMaterial, ShaderMaterialParameters } from "three";
import { Defines, useDefines } from "@/registry/webgl/hooks/use-defines";

type ShaderProgram<U extends Record<string, IUniform> = {}> = ShaderMaterial & {
  uniforms: U;
  setDefine: (name: string, value: string) => void;
};

export function useShader<U extends Record<string, IUniform> = {}>(
  parameters: Omit<ShaderMaterialParameters, "uniforms"> & U = {} as U,
  defines?: Defines
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

  useDefines(program, defines)

  return program;
}

