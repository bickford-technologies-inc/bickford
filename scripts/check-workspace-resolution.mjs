import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Replacement for legacy scripts/check-workspace-resolution.sh.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const log = (message) => {
  process.stdout.write(`${message}\n`);
};

log("🔍 Scanning for unresolved workspace module usage...");

log("— Searching for unresolved module errors in repo —");
const rgResult = spawnSync(
  "rg",
  ["Cannot find module '@bickford/|Module not found: Can't resolve '@bickford/", "."],
  { cwd: root, stdio: "inherit" }
);
if (rgResult.error) {
  log(`⚠️ Unable to run rg: ${rgResult.error.message}`);
}

log("— Enumerating workspace packages —");

const packageJson = JSON.parse(
  readFileSync(path.join(root, "package.json"), "utf-8")
);
const workspaces = Array.isArray(packageJson.workspaces)
  ? packageJson.workspaces
  : [];

let failed = false;

for (const workspace of workspaces) {
  const packagePath = path.join(root, workspace);
  const packageJsonPath = path.join(packagePath, "package.json");

  if (!existsSync(packageJsonPath)) {
    continue;
  }

  const workspacePackage = JSON.parse(
    readFileSync(packageJsonPath, "utf-8")
  );
  const name = workspacePackage.name || "";

  if (!name) {
    continue;
  }

  log("");
  log(`🔎 Checking ${name} (${workspace})`);

  const main = workspacePackage.main || "";
  const types = workspacePackage.types || "";
  const exportsField = workspacePackage.exports;

  if (!main || !types || exportsField == null) {
    log("❌ package.json missing main/types/exports");
    failed = true;
  }

  const distPath = path.join(packagePath, "dist");
  if (!existsSync(distPath)) {
    log("❌ dist/ directory missing");
    failed = true;
  } else {
    if (!existsSync(path.join(distPath, "index.js"))) {
      log("❌ dist/index.js missing");
      failed = true;
    }
    if (!existsSync(path.join(distPath, "index.d.ts"))) {
      log("❌ dist/index.d.ts missing");
      failed = true;
    }
  }
}

if (failed) {
  log("");
  log("🚫 WORKSPACE RESOLUTION CHECK FAILED");
  log("Fix packages above before running Next.js build.");
  process.exit(1);
}

log("");
log("✅ Workspace resolution invariant satisfied");
