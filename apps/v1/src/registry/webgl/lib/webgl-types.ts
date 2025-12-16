import { IUniform } from "three";

/**
 * A record of shader uniform values.
 * Keys are uniform names, values are THREE.IUniform objects containing the uniform value.
 */
export type Uniforms = Record<string, IUniform>;
