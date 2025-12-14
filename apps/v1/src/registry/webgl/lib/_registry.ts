import { type Registry } from "shadcn/schema"

export const lib: Registry["items"] = [
  {
    name: "double-fbo",
    type: "registry:lib",
    description: "A utility class for managing double frame buffer objects with ping-pong functionality",
    dependencies: ["three"],
    files: [
      {
        path: "registry/webgl/lib/double-fbo.ts",
        type: "registry:lib",
      },
    ],
  },
]
