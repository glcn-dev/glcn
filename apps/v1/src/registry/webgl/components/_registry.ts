import { type Registry } from "shadcn/schema";

export const components: Registry["items"] = [
  {
    name: "render-texture",
    type: "registry:component",
    description:
      "A component for rendering React Three Fiber scenes to textures",
    dependencies: ["@react-three/fiber", "three"],
    files: [
      {
        path: "registry/webgl/components/render-texture.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "quad-shader",
    type: "registry:component",
    description:
      "A utility for rendering a given ShaderMaterial to a quad mesh, optionally to a render target",
    dependencies: ["@react-three/fiber", "three"],
    registryDependencies: ["quads", "save-gl-state"],
    files: [
      {
        path: "registry/webgl/components/quad-shader.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "fbo-debug",
    type: "registry:component",
    description:
      "A component for visualizing Three.js framebuffer objects and render targets for debugging purposes.",
    dependencies: ["@react-three/fiber", "leva", "three"],
    registryDependencies: [
      "double-fbo",
      "use-uniforms",
      "use-raw-shader",
      "save-gl-state",
    ],
    files: [
      {
        path: "registry/webgl/components/fbo-debug.tsx",
        type: "registry:component",
      },
    ],
  },
];
