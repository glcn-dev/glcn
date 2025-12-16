import { type Registry } from "shadcn/schema";

export const shaderChunks: Registry["items"] = [
  {
    name: "bayer-2x2",
    type: "registry:lib",
    files: [
      {
        path: "registry/webgl/lib/shader-chunks/bayer-2x2.glsl",
        type: "registry:lib",
        target: "lib/shader-chunks/bayer-2x2.glsl",
      },
    ],
  },
];

/**
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "simplex-noise",
  "type": "registry:lib",
  "description": "Simplex noise GLSL shader chunk",
  "files": [
    {
      "path": "lib/shader-chunks/simplex-noise.glsl",
      "type": "registry:lib",
      "content": "// GLSL simplex noise implementation\nvec3 mod289(vec3 x) { ... }"
    }
  ]
}
 */
