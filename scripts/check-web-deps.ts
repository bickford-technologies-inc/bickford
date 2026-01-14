import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Canonical invariant:
 * - Scripts MUST NOT assume cwd
 * - Repo root is derived structurally
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// repo root = one level above /scripts
const REPO_ROOT = path.resolve(__dirname, "..");

// web package must exist at a canonical location
const WEB_PKG_PATH = path.join(REPO_ROOT, "apps", "web", "package.json");

if (!fs.existsSync(WEB_PKG_PATH)) {
  throw new Error(
    `[CANON_VIOLATION] Expected web package at ${WEB_PKG_PATH} but it does not exist.\nThis indicates a path authority violation or repo structure drift.`
  );
}

const pkg = JSON.parse(fs.readFileSync(WEB_PKG_PATH, "utf8"));

if (!pkg.name || pkg.name !== "@bickford/web") {
  throw new Error(
    `[CANON_VIOLATION] apps/web/package.json does not declare @bickford/web`
  );
}

const REQUIRED = ["@bickford/ledger", "@bickford/core", "@bickford/canon"];

for (const dep of REQUIRED) {
  if (!pkg.dependencies?.[dep]) {
    throw new Error(
      `[CANON_VIOLATION] web imports ${dep} but it is not declared in dependencies`
    );
  }
}

console.log("✔ check-web-deps: web package path and identity verified");
