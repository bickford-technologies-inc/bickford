import fs from "fs";
import { spawnSync } from "child_process";

const errors = [];

function assertFile(path, required = true) {
  if (!fs.existsSync(path) === !!required) {
    errors.push(`Missing required file: ${path}`);
  }
}
function assertJson(path, requiredKeys = []) {
  try {
    const raw = fs.readFileSync(path, "utf8");
    const data = JSON.parse(raw);
    requiredKeys.forEach((k) => {
      if (!(k in data)) errors.push(`Missing key "${k}" in ${path}`);
    });
  } catch {
    errors.push(`Invalid or unreadable: ${path}`);
  }
}

// 1. Check config
assertFile("vercel.json");
assertJson("vercel.json", [
  "framework",
  "installCommand",
  "buildCommand",
  "outputDirectory",
]);

// 2. Check package manager
assertFile("pnpm-lock.yaml");
assertFile("package.json");

// 3. Node version
if (!fs.existsSync(".nvmrc"))
  errors.push("Missing .nvmrc for Node version pin");

const nodeVer = fs.existsSync(".nvmrc")
  ? fs.readFileSync(".nvmrc", "utf8").trim()
  : null;
if (nodeVer && nodeVer !== "20")
  errors.push(`Node version must be 20, found ${nodeVer}`);

// 4. Scripts
["scripts/assert-intent-phase.mjs", "scripts/assert-vercel-binding.ts"].forEach(
  assertFile,
);

// 5. Runtime module
assertFile("packages/bickford/src/runtime/tenantRegionPolicy.ts");

// 6. Types package
assertFile("packages/types/package.json");

// 7. Local build (oracle)
const buildResult = spawnSync("pnpm", ["run", "build"], { stdio: "inherit" });
if (buildResult.status !== 0) errors.push("Local pnpm run build failed");

const vercelResult = spawnSync("vercel", ["build"], { stdio: "inherit" });
if (vercelResult.status !== 0) errors.push("Local vercel build failed");

if (errors.length) {
  console.error("❌ Vercel preflight check failed:\n" + errors.join("\n"));
  process.exit(1);
} else {
  console.log("✅ Vercel preflight passed, all invariants satisfied");
}
