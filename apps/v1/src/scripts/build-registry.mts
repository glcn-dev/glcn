import { exec } from "child_process"
import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { rimraf } from "rimraf"
import { registrySchema, type Registry } from "shadcn/schema"

// Get current directory for relative imports
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("🔍 Script location:", __filename)
console.log("🔍 Script directory:", __dirname)
console.log("🔍 Current working directory:", process.cwd())

// Import registry definitions with explicit relative paths
const componentsPath = path.resolve(__dirname, "../registry/webgl/components/_registry.js")
const hooksPath = path.resolve(__dirname, "../registry/webgl/hooks/_registry.js")
const libPath = path.resolve(__dirname, "../registry/webgl/lib/_registry.js")

console.log("🔍 Components path:", componentsPath)
console.log("🔍 Hooks path:", hooksPath)
console.log("🔍 Lib path:", libPath)

const componentsModule = await import(componentsPath)
const hooksModule = await import(hooksPath)
const libModule = await import(libPath)

console.log("🔍 Components module keys:", Object.keys(componentsModule))
console.log("🔍 Hooks module keys:", Object.keys(hooksModule))
console.log("🔍 Lib module keys:", Object.keys(libModule))

const { components } = componentsModule
const { hooks } = hooksModule
const { lib } = libModule

const REGISTRY_NAME = "shadercn/webgl"
const REGISTRY_HOMEPAGE = "https://shadercn.dev"
const REGISTRY_URL = "https://shadercn.dev/r/webgl"
const OUTPUT_DIR = "public/r/webgl"

async function buildRegistry() {
  try {
    console.log("🏗️  Building WebGL registry...")

    // Merge all registry items and fix file paths
    const registry: Registry = {
      name: REGISTRY_NAME,
      homepage: REGISTRY_HOMEPAGE,
      items: [...components, ...hooks, ...lib].map((item) => {
        const hasThreeDependency = item.dependencies?.includes("three")

        return {
          ...item,
          // Convert registryDependencies from simple names to full URLs
          registryDependencies: item.registryDependencies?.map(
            (dep: string) => `${REGISTRY_URL}/${dep}.json`
          ),
          // Automatically add @types/three to devDependencies if three is used
          devDependencies: hasThreeDependency
            ? ["@types/three"]
            : item.devDependencies,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          files: item.files?.map((file: any) => ({
            ...file,
            path: `src/${file.path}`,
          })),
        }
      }),
    }

    // Validate the registry schema
    console.log("✅ Validating registry schema...")
    const parseResult = registrySchema.safeParse(registry)
    if (!parseResult.success) {
      console.error("❌ Registry validation failed:")
      console.error(parseResult.error.format())
      throw new Error("Invalid registry schema")
    }

    console.log(`📦 Found ${registry.items.length} items`)

    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    // Write main registry file to root
    console.log("📝 Writing registry-webgl.json...")
    const registryJsonPath = path.join(process.cwd(), "registry-webgl.json")
    await fs.writeFile(registryJsonPath, JSON.stringify(registry, null, 2))

    // Write temporary registry file for shadcn build
    const tempRegistryPath = path.join(
      process.cwd(),
      "registry-temp.json"
    )
    await fs.writeFile(tempRegistryPath, JSON.stringify(registry, null, 2))

    // Use shadcn build command to generate individual component files
    console.log("🔨 Building individual component files...")
    await new Promise<void>((resolve, reject) => {
      const buildProcess = exec(
        `npx shadcn@latest build registry-temp.json --output ${OUTPUT_DIR}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("Build error:", stderr)
            reject(error)
            return
          }
          if (stdout) console.log(stdout)
          resolve()
        }
      )

      buildProcess.on("exit", (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Build process exited with code ${code}`))
        }
      })
    })

    // Clean up temporary file
    console.log("🧹 Cleaning up...")
    rimraf.sync(tempRegistryPath)

    console.log("✅ Build complete!")
    console.log(`📁 Registry: ${registryJsonPath}`)
    console.log(`📁 Components: ${OUTPUT_DIR}/`)

  } catch (error) {
    console.error("❌ Build failed:", error)
    process.exit(1)
  }
}

buildRegistry()
