import type { RefObject } from "react";
import { useMemo } from "react";
import { createPortal, useFrame } from "@react-three/fiber";
import type { RenderCallback } from "@react-three/fiber";
import type { ShaderMaterial, WebGLRenderTarget } from "three";
import { Scene } from "three";
import { quadGeometry, quadCamera } from "@/registry/webgl/lib/quads";

/**
 * Props for the QuadShader component, which renders a fullscreen quad mesh with a given ShaderMaterial.
 */
export interface QuadShaderProps {
  /**
   * The ShaderMaterial to be applied to the quad.
   */
  program: ShaderMaterial;
  /**
   * The WebGLRenderTarget or its ref to render to, or null to render to screen.
   */
  renderTarget: WebGLRenderTarget | RefObject<WebGLRenderTarget> | null;
  /**
   * Optional callback to run before rendering the quad.
   */
  beforeRender?: RenderCallback;
  /**
   * Optional callback to run after rendering the quad.
   */
  afterRender?: RenderCallback;
  /**
   * Whether the quad should automatically render each frame. Defaults to true.
   */
  autoRender?: boolean;
  /**
   * Priority of the render callback in the render loop.
   */
  priority?: number;
}

/**
 * Renders a fullscreen quad mesh with the provided ShaderMaterial, optionally to a render target.
 * This is commonly used for postprocessing or rendering effects to a texture.
 */
export function QuadShader({
  program,
  renderTarget,
  beforeRender,
  afterRender,
  autoRender = true,
  priority = 0,
}: QuadShaderProps) {
  const containerScene = useMemo(() => new Scene(), []);

  useFrame((state, delta) => {
    if (beforeRender) {
      beforeRender(state, delta);
    }
    if (autoRender) {
      if (!renderTarget) {
        // render to screen
        state.gl.setRenderTarget(null);

        state.gl.render(containerScene, quadCamera);
      } else {
        // render target set
        if ("current" in renderTarget) {
          state.gl.setRenderTarget(renderTarget.current);
        } else {
          state.gl.setRenderTarget(renderTarget);
        }
      }

      state.gl.render(containerScene, quadCamera);
      state.gl.setRenderTarget(null);
    }

    if (afterRender) {
      afterRender(state, delta);
    }
  }, priority);

  return (
    <>
      {createPortal(
        <mesh geometry={quadGeometry}>
          <primitive object={program} />
        </mesh>,

        containerScene
      )}
    </>
  );
}

export function QuadMesh({ children }: { children: React.ReactNode }) {
  return <mesh geometry={quadGeometry}>{children}</mesh>;
}
