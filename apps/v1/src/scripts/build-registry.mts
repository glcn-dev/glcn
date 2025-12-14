import { exec } from "child_process"
import { promises as fs } from "fs"
import path from "path"
import { rimraf } from "rimraf"
import { registrySchema, type Registry } from "shadcn/schema"

// Import registry definitions
import { components } from "@/registry/webgl/components/_registry"
import { hooks } from "@/registry/webgl/hooks/_registry"
import { lib } from "@/registry/webgl/lib/_registry"

const REGISTRY_NAME = "shadercn/webgl"
const REGISTRY_HOMEPAGE = "https://shadercn.dev"
const OUTPUT_DIR = "public/r/webgl"

async function buildRegistry() {
  try {
    console.log("🏗️  Building WebGL registry...")

    // Merge all registry items and fix file paths
    const registry: Registry = {
      name: REGISTRY_NAME,
      homepage: REGISTRY_HOMEPAGE,
      items: [...components, ...hooks, ...lib].map((item) => ({
        ...item,
        files: item.files?.map((file) => ({
          ...file,
          path: `src/${file.path}`,
        })),
      })),
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
