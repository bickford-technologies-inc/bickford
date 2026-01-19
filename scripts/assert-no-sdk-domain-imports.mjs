import fs from "fs";
import path from "path";

const FORBIDDEN_SDKS = [
  "@vercel/sdk",
  "aws-sdk",
  "@aws-sdk",
  "stripe",
  "@anthropic-ai",
];

const PACKAGES_DIR = "packages";

/**
 * A package is considered INTEGRATION if its folder name ends with `-integration`
 */
function isIntegrationPackage(pkgPath) {
  return pkgPath.endsWith("-integration");
}

function shouldSkipDir(dir) {
  return (
    dir.includes("node_modules") ||
    dir.includes(".next") ||
    dir.includes("dist") ||
    dir.includes("build")
  );
}

function scanPackage(pkgPath) {
  if (isIntegrationPackage(pkgPath)) {
    // ✅ SDK imports explicitly allowed here
    return;
  }

  function walk(dir) {
    if (shouldSkipDir(dir)) return;

    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
        continue;
      }

      if (!full.endsWith(".ts") && !full.endsWith(".tsx")) continue;

      const src = fs.readFileSync(full, "utf8");

      for (const sdk of FORBIDDEN_SDKS) {
        if (src.includes(sdk)) {
          console.error(
            `❌ Forbidden SDK import detected\n` +
              `   SDK: ${sdk}\n` +
              `   File: ${full}\n` +
              `   Package: ${pkgPath}\n` +
              `   Rule: SDKs are forbidden in canon/core/runtime/types packages`,
          );
          process.exit(1);
        }
      }
    }
  }

  walk(pkgPath);
}

for (const pkg of fs.readdirSync(PACKAGES_DIR)) {
  const pkgPath = path.join(PACKAGES_DIR, pkg);
  if (!fs.statSync(pkgPath).isDirectory()) continue;
  scanPackage(pkgPath);
}

console.log("✅ SDK boundary invariant satisfied");
