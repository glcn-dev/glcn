import { type Registry } from "shadcn/schema"

export const components: Registry["items"] = [
  {
    name: "render-texture",
    type: "registry:component",
    description: "A component for rendering React Three Fiber scenes to textures",
    dependencies: ["@react-three/fiber", "three"],
    files: [
      {
        path: "registry/webgl/components/render-texture.tsx",
        type: "registry:component",
      },
    ],
  },
]
