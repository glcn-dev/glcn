import { useEffect } from "react";
import { RawShaderMaterial, ShaderMaterial } from "three";

export type Defines = Record<string, string | number | boolean>;

export function useDefines(
  program: ShaderMaterial | RawShaderMaterial,
  defines?: Defines
) {
  // Make program react to defines
  useEffect(() => {
    if (!program || !defines) return;

    // Get current defines and new defines
    const programDefines = program.defines || {};
    const newDefines = defines || {};

    let needsUpdate = false;

    // Update or add defines that are new or changed
    for (const key of Object.keys(newDefines)) {
      if (programDefines[key] !== newDefines[key]) {
        // eslint-disable-next-line react-hooks/immutability
        programDefines[key] = newDefines[key];
        needsUpdate = true;
      }
    }

    // Remove defines that are no longer present
    for (const key of Object.keys(programDefines)) {
      if (!(key in newDefines)) {
        delete programDefines[key];
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      // eslint-disable-next-line react-hooks/immutability
      program.needsUpdate = true;
    }
  }, [program, defines]);
}
