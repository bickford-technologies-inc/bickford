import fs from "fs"
import path from "path"
import fg from "fast-glob"

const policy = JSON.parse(
  fs.readFileSync(
    "infra/authority/execution-boundaries.json",
    "utf8"
  )
)

const files = fg.sync(policy.paths, {
  ignore: ["**/*.test.*", "**/*.spec.*", "**/*.d.ts"]
})

let violations = 0

for (const file of files) {
  const src = fs.readFileSync(file, "utf8")

  const hasAuthorityImport =
    src.includes(`from "${policy.requiredImport}"`) ||
    src.includes(`require("${policy.requiredImport}")`)

  const callsAuthorize =
    src.includes(`${policy.requiredSymbol}(`)

  if (!hasAuthorityImport || !callsAuthorize) {
    console.error(
      `❌ AUTHORITY VIOLATION: ${file}`
    )
    violations++
  }
}

if (violations > 0) {
  console.error(
    `\n${violations} execution paths bypass authority`
  )
  process.exit(1)
}

console.log("✅ Authority enforcement verified")
