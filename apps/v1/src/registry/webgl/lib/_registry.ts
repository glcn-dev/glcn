import { type Registry } from "shadcn/schema";
import { shaderChunks } from "./shader-chunks/_registry";

export const lib: Registry["items"] = [
  {
    name: "double-fbo",
    type: "registry:lib",
    description:
      "A utility class for managing double frame buffer objects with ping-pong functionality",
    dependencies: ["three"],
    files: [
      {
        path: "registry/webgl/lib/double-fbo.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "webgl-types",
    type: "registry:lib",
    description:
      "Type definitions for common Three.js WebGL uniforms and utilities",
    dependencies: ["three"],
    files: [
      {
        path: "registry/webgl/lib/webgl-types.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "quads",
    type: "registry:lib",
    description:
      "Utilities for creating fullscreen quad geometry and camera useful for full screen shaders.",
    dependencies: ["three"],
    files: [
      {
        path: "registry/webgl/lib/quads.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "save-gl-state",
    type: "registry:lib",
    description:
      "Utility for saving and restoring Three.js WebGLRenderer state (viewport, clear color, render target, etc).",
    dependencies: ["three", "@react-three/fiber"],
    files: [
      {
        path: "registry/webgl/lib/save-gl-state.ts",
        type: "registry:lib",
      },
    ],
  },
  ...shaderChunks,
];
