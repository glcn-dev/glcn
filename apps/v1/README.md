# shadercn/webgl Registry

A TypeScript-based registry system for WebGL components, hooks, and utilities following the shadcn/ui registry specification.

## Overview

This project implements a component registry that enables CLI-driven installation of WebGL utilities for React Three Fiber projects. Components are defined in TypeScript files (`_registry.ts`) and compiled into JSON files compatible with the shadcn CLI.

## Architecture

```
src/
├── registry/
│   └── webgl/
│       ├── components/
│       │   ├── _registry.ts          # Component definitions
│       │   └── render-texture.tsx    # Actual component
│       ├── hooks/
│       │   ├── _registry.ts          # Hook definitions
│       │   ├── use-defines.ts
│       │   ├── use-double-fbo.ts
│       │   ├── use-fbo.ts
│       │   ├── use-raw-shader.ts
│       │   ├── use-shader.ts
│       │   └── use-uniforms.ts
│       └── lib/
│           ├── _registry.ts          # Utility definitions
│           └── double-fbo.ts
└── scripts/
    └── build-registry.mts            # Build script

registry-webgl.json                    # Generated manifest
public/r/webgl/                        # Generated component files
```

## Registry Definition Files

Each directory contains a `_registry.ts` file that exports an array of registry items:

### Example: Hook Registry

```typescript
import { type Registry } from "shadcn/schema"

export const hooks: Registry["items"] = [
  {
    name: "use-shader",
    type: "registry:hook",
    description: "A hook for creating and managing ShaderMaterial",
    dependencies: ["three"],
    registryDependencies: ["use-defines"],
    files: [
      {
        path: "registry/webgl/hooks/use-shader.ts",
        type: "registry:hook",
      },
    ],
  },
]
```

### Registry Item Structure

Each registry item includes:

- **name**: Unique identifier (kebab-case)
- **type**: Item type (`registry:component`, `registry:hook`, `registry:lib`)
- **description**: Brief description of the component
- **dependencies**: NPM packages required (e.g., `"three"`, `"@react-three/fiber"`)
- **registryDependencies**: Other registry items required (e.g., `"use-defines"`)
- **files**: Array of source files with paths and types

## Build Process

The build script (`src/scripts/build-registry.mts`) performs the following:

1. **Import**: Loads all `_registry.ts` files
2. **Merge**: Combines all registry items into a single registry
3. **Validate**: Checks against shadcn registry schema
4. **Transform**: Processes file paths (adds `src/` prefix)
5. **Build**: Uses shadcn CLI to generate individual JSON files
6. **Output**: 
   - `registry-webgl.json` - Main manifest
   - `public/r/webgl/*.json` - Individual component files

### Build Command

```bash
pnpm registry
```

This command runs:
```bash
tsx --tsconfig ./tsconfig.scripts.json ./src/scripts/build-registry.mts
```

## Import Conventions

All imports within registry files use the `@/` alias pattern:

```typescript
// ✅ Correct
import { DoubleFbo } from "@/registry/webgl/lib/double-fbo"
import { useDefines } from "@/registry/webgl/hooks/use-defines"

// ❌ Wrong
import { DoubleFbo } from "../lib/double-fbo"
import { useDefines } from "./use-defines"
```

## Registry Contents

### Components (1)

- **render-texture**: React Three Fiber component for rendering scenes to textures

### Hooks (6)

- **use-defines**: Manage shader defines in Three.js materials
- **use-double-fbo**: Manage double frame buffer objects with ping-pong
- **use-fbo**: Manage frame buffer objects
- **use-raw-shader**: Create and manage RawShaderMaterial with defines
- **use-shader**: Create and manage ShaderMaterial with defines
- **use-uniforms**: Manage shader uniforms

### Utilities (1)

- **double-fbo**: Class for managing double frame buffer objects

## Dependency Resolution

The registry handles two types of dependencies:

### NPM Dependencies
External packages installed from npm:
```typescript
dependencies: ["@react-three/fiber", "three"]
```

### Registry Dependencies
Other items in the registry that must be installed first:
```typescript
registryDependencies: ["use-defines", "double-fbo"]
```

Example dependency chain:
- `use-shader` depends on `use-defines` (registry)
- `use-double-fbo` depends on `double-fbo` (registry) and `three` (npm)

## Generated Files

After running `pnpm registry`, the following files are generated:

### Root Manifest
```
registry-webgl.json
```

Contains metadata and all registry items with their dependencies.

### Component Files
```
public/r/webgl/
├── registry.json
├── render-texture.json
├── use-defines.json
├── use-double-fbo.json
├── use-fbo.json
├── use-raw-shader.json
├── use-shader.json
├── use-uniforms.json
└── double-fbo.json
```

Each file includes:
- Component metadata
- Inlined source code
- Dependencies
- Schema validation

## Adding New Components

To add a new component to the registry:

1. **Create the component file** in the appropriate directory:
   ```
   src/registry/webgl/hooks/use-my-hook.ts
   ```

2. **Add registry definition** to the corresponding `_registry.ts`:
   ```typescript
   {
     name: "use-my-hook",
     type: "registry:hook",
     description: "Description of the hook",
     dependencies: ["three"],
     files: [
       {
         path: "registry/webgl/hooks/use-my-hook.ts",
         type: "registry:hook",
       },
     ],
   }
   ```

3. **Use alias imports** in your component:
   ```typescript
   import { useDefines } from "@/registry/webgl/hooks/use-defines"
   ```

4. **Rebuild the registry**:
   ```bash
   pnpm registry
   ```

## Integration with Build

The registry build is automatically triggered during the main build process:

```json
{
  "scripts": {
    "build": "pnpm registry && pnpm --filter=shadcn build && next build"
  }
}
```

This ensures the registry is always up-to-date before deployment.

## Git Ignore

Generated files are excluded from version control:

```gitignore
# registry
registry-*.json
/public/r/*
```

Only the source `_registry.ts` files and component implementations are tracked.

## Schema Validation

The build process validates all registry items against the official shadcn/ui schema:

- Schema URL: `https://ui.shadcn.com/schema/registry.json`
- Item Schema: `https://ui.shadcn.com/schema/registry-item.json`

Validation ensures:
- All required fields are present
- Dependencies are properly formatted
- File paths are valid
- Registry structure is correct

## Registry Metadata

```json
{
  "name": "shadercn/webgl",
  "homepage": "https://shadercn.dev",
  "items": [...]
}
```

- **name**: Unique registry identifier
- **homepage**: Registry documentation URL
- **items**: Array of all registry components

## TypeScript Configuration

The build script uses a dedicated TypeScript configuration:

```json
// tsconfig.scripts.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2017",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "isolatedModules": false,
    "allowImportingTsExtensions": true
  },
  "include": ["scripts/**/*.{ts,mts}"]
}
```

This allows the build script to import TypeScript files directly using tsx.

## References

- [shadcn/ui Registry Documentation](https://ui.shadcn.com/docs/registry)
- [Registry Schema Specification](https://ui.shadcn.com/schema/registry.json)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Three.js](https://threejs.org/)
