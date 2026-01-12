#!/usr/bin/env node
/**
 * Edge Guard - CI Guard for Edge Runtime Invariant Enforcement
 * 
 * Ensures:
 * 1. Prisma Client is never imported in edge contexts
 * 2. Edge-compatible alternatives are used (@bickford/ledger/edge)
 * 3. Node-only modules have proper runtime checks
 * 4. Vercel Edge Functions don't use Node.js-only APIs
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative, extname } from "path";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

const PROJECT_ROOT = process.cwd();

function log(level, message) {
  const prefix = {
    error: `${RED}[EDGE-GUARD ERROR]${RESET}`,
    success: `${GREEN}[EDGE-GUARD OK]${RESET}`,
    warn: `${YELLOW}[EDGE-GUARD WARN]${RESET}`,
    info: "[EDGE-GUARD]",
  };
  console.log(`${prefix[level]} ${message}`);
}

const FORBIDDEN_EDGE_IMPORTS = [
  "@prisma/client",
  "pg",
  "fs",
  "fs/promises",
  "child_process",
  "@bickford/ledger/db",
];

const ALLOWED_EDGE_IMPORTS = [
  "@bickford/ledger/edge",
  "@bickford/types",
];

function isEdgeFile(filePath) {
  // Detect edge runtime files
  const content = readFileSync(filePath, "utf-8");
  
  // Check for Edge runtime exports config
  if (content.includes('export const runtime = "edge"')) {
    return true;
  }
  
  // Check for Edge runtime environment variable usage
  if (content.includes("NEXT_RUNTIME") || content.includes("EdgeRuntime")) {
    return true;
  }
  
  // Check file path patterns
  const relativePath = relative(PROJECT_ROOT, filePath);
  if (
    relativePath.includes("/edge/") ||
    relativePath.includes("edge.ts") ||
    relativePath.includes("edge.js")
  ) {
    return true;
  }
  
  return false;
}

function checkFileForForbiddenImports(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const violations = [];

  for (const forbidden of FORBIDDEN_EDGE_IMPORTS) {
    // Check for direct imports
    const importRegex = new RegExp(
      `import .* from ['"]${forbidden.replace("/", "\\/")}['"]`,
      "g"
    );
    const requireRegex = new RegExp(
      `require\\(['"]${forbidden.replace("/", "\\/")}['"]\\)`,
      "g"
    );

    if (importRegex.test(content) || requireRegex.test(content)) {
      violations.push({
        file: relative(PROJECT_ROOT, filePath),
        forbidden,
      });
    }
  }

  return violations;
}

function findTypeScriptFiles(dir, files = []) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, .git
      if (
        entry === "node_modules" ||
        entry === ".git" ||
        entry === "dist" ||
        entry === ".next"
      ) {
        continue;
      }
      findTypeScriptFiles(fullPath, files);
    } else {
      const ext = extname(entry);
      if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function checkEdgeFiles() {
  log("info", "Scanning for Edge runtime files...");

  const allFiles = findTypeScriptFiles(PROJECT_ROOT);
  const edgeFiles = allFiles.filter(isEdgeFile);

  if (edgeFiles.length === 0) {
    log("info", "No Edge runtime files detected");
    return;
  }

  log("info", `Found ${edgeFiles.length} Edge runtime file(s)`);

  let hasViolations = false;

  for (const file of edgeFiles) {
    const violations = checkFileForForbiddenImports(file);
    if (violations.length > 0) {
      hasViolations = true;
      log("error", `Edge invariant violations in ${relative(PROJECT_ROOT, file)}:`);
      for (const v of violations) {
        log("error", `  - Forbidden import: ${v.forbidden}`);
        log(
          "error",
          `    Use edge-compatible alternative (e.g., @bickford/ledger/edge)`
        );
      }
    }
  }

  if (hasViolations) {
    log("error", "INVARIANT VIOLATION: Edge files must not import Node.js-only modules");
    process.exit(1);
  }

  log("success", "All Edge files use edge-compatible imports");
}

function checkNodeRuntimeAssertions() {
  log("info", "Checking Node runtime assertions...");

  const dbFiles = [
    join(PROJECT_ROOT, "packages/ledger/src/db.ts"),
    join(PROJECT_ROOT, "packages/ledger/src/index.ts"),
  ];

  for (const file of dbFiles) {
    if (!existsSync(file)) continue;

    const content = readFileSync(file, "utf-8");
    if (!content.includes("assertNodeRuntime")) {
      log(
        "error",
        `${relative(PROJECT_ROOT, file)} must call assertNodeRuntime()`
      );
      process.exit(1);
    }
  }

  log("success", "Node runtime assertions present");
}

function checkExportsMap() {
  log("info", "Checking package.json exports map...");

  const ledgerPackageJson = join(
    PROJECT_ROOT,
    "packages/ledger/package.json"
  );

  if (!existsSync(ledgerPackageJson)) {
    log("warn", "Ledger package.json not found");
    return;
  }

  const packageJson = JSON.parse(readFileSync(ledgerPackageJson, "utf-8"));

  if (!packageJson.exports) {
    log("error", "Missing exports map in @bickford/ledger");
    process.exit(1);
  }

  const hasEdgeExport =
    packageJson.exports["."]?.edge || packageJson.exports["./edge"];

  if (!hasEdgeExport) {
    log("error", "Missing edge export in @bickford/ledger exports map");
    process.exit(1);
  }

  log("success", "Exports map correctly configured");
}

function main() {
  console.log("\n🌍 Edge Guard - Enforcing Edge/Node Isolation\n");

  checkExportsMap();
  checkNodeRuntimeAssertions();
  checkEdgeFiles();

  console.log(`\n${GREEN}✓ All Edge/Node isolation invariants satisfied${RESET}\n`);
}

main();
