import type { RootState } from "@react-three/fiber";
import { Color, Vector4 } from "three";

/**
 * Saves the current WebGL renderer state and returns a function to restore it.
 * Captures render target, clear color/alpha, viewport, autoClear, and output color space.
 *
 * Useful when temporarily modifying GL state for custom render passes.
 *
 * @param state - The R3F root state containing the WebGL renderer
 * @returns A restore function that resets all captured state
 *
 * @example
 * useFrame((state) => {
 *   const restore = saveGlState(state);
 *
 *   // Modify GL state for custom rendering
 *   state.gl.setRenderTarget(myFbo);
 *   state.gl.autoClear = false;
 *   state.gl.render(scene, camera);
 *
 *   // Restore original state
 *   restore();
 * });
 */
export function saveGlState(state: RootState) {
  const prevTarget = state.gl.getRenderTarget();
  const prevClearColor = new Color();
  state.gl.getClearColor(prevClearColor);
  const prevClearAlpha = state.gl.getClearAlpha();
  const prevViewport = new Vector4();
  state.gl.getViewport(prevViewport);
  const prevAutoClear = state.gl.autoClear;
  const prevOutputColorSpace = state.gl.outputColorSpace;

  const restore = () => {
    state.gl.setRenderTarget(prevTarget);
    state.gl.setClearColor(prevClearColor, prevClearAlpha);
    state.gl.setViewport(prevViewport);
    state.gl.autoClear = prevAutoClear;
    state.gl.outputColorSpace = prevOutputColorSpace;
  };

  return restore;
}
