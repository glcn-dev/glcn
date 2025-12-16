import { useEffect } from "react";
import { RawShaderMaterial, ShaderMaterial } from "three";

/**
 * A record of shader preprocessor defines.
 * Keys are define names, values can be strings, numbers, or booleans.
 */
export type Defines = Record<string, string | number | boolean>;

/**
 * Reactively syncs shader defines with a ShaderMaterial or RawShaderMaterial.
 * Automatically adds, updates, or removes defines when they change,
 * and triggers shader recompilation only when needed.
 *
 * @param program - The shader material to update defines on
 * @param defines - The defines object to sync with the shader
 *
 * @example
 * const [quality, setQuality] = useState('HIGH');
 *
 * // Defines are automatically synced, no need to memorize the object
 * useDefines(material, {
 *   QUALITY: quality,
 *   USE_SHADOWS: true,
 * });
 *
 * // Changing quality will trigger shader recompilation
 * setQuality('LOW');
 */
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
