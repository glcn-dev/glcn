import { type Registry } from "shadcn/schema";

export const hooks: Registry["items"] = [
  {
    name: "use-defines",
    type: "registry:hook",
    description: "A hook for managing shader defines in Three.js materials",
    dependencies: ["three"],
    files: [
      {
        path: "registry/webgl/hooks/use-defines.ts",
        type: "registry:hook",
      },
    ],
  },
  {
    name: "use-double-fbo",
    type: "registry:hook",
    description:
      "A hook for managing double frame buffer objects with automatic ping-pong",
    dependencies: ["@react-three/fiber", "three"],
    registryDependencies: ["double-fbo"],
    files: [
      {
        path: "registry/webgl/hooks/use-double-fbo.ts",
        type: "registry:hook",
      },
    ],
  },
  {
    name: "use-fbo",
    type: "registry:hook",
    description:
      "A hook for managing frame buffer objects in React Three Fiber",
    dependencies: ["@react-three/fiber", "three"],
    files: [
      {
        path: "registry/webgl/hooks/use-fbo.ts",
        type: "registry:hook",
      },
    ],
  },
  {
    name: "use-raw-shader",
    type: "registry:hook",
    description:
      "A hook for creating and managing RawShaderMaterial with defines support",
    dependencies: ["three"],
    registryDependencies: ["use-defines", "webgl-types"],
    files: [
      {
        path: "registry/webgl/hooks/use-raw-shader.ts",
        type: "registry:hook",
      },
    ],
  },
  {
    name: "use-shader",
    type: "registry:hook",
    description:
      "A hook for creating and managing ShaderMaterial with defines support",
    dependencies: ["three"],
    registryDependencies: ["use-defines", "webgl-types"],
    files: [
      {
        path: "registry/webgl/hooks/use-shader.ts",
        type: "registry:hook",
      },
    ],
  },
  {
    name: "use-uniforms",
    type: "registry:hook",
    description: "A hook for managing shader uniforms in Three.js",
    dependencies: ["three"],
    files: [
      {
        path: "registry/webgl/hooks/use-uniforms.ts",
        type: "registry:hook",
      },
    ],
  },
];
