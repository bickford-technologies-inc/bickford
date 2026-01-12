#!/usr/bin/env node
/**
 * Canon Invariants Checker
 * 
 * Enforces canonical invariants for Bickford Canon package:
 * 1. Canon package must exist with full surface exports
 * 2. All canon modules must be present
 * 3. Canon must be loadable from core
 * 4. Promotion gate must be enforced
 * 5. OPTR must include all upgrades
 * 6. Runtime must validate execution context
 * 
 * TIMESTAMP: 2026-02-08T00:00:00Z
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function fail(msg) {
  console.error(`\n❌ CANON INVARIANT FAILED: ${msg}\n`);
  process.exit(1);
}

function exists(p) {
  return fs.existsSync(p);
}

function requireFile(p) {
  if (!exists(p)) fail(`Missing required file: ${p}`);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

function readFile(p) {
  return fs.readFileSync(p, "utf8");
}

console.log("🔍 Checking Canon invariants...\n");

// ---------- 1) Canon package must exist ----------
const canonPackagePath = path.join(ROOT, "packages/canon/package.json");
requireFile(canonPackagePath);

const canonPkg = JSON.parse(readFile(canonPackagePath));
assert(
  canonPkg.name === "@bickford/canon",
  "Canon package must be named @bickford/canon"
);

// ---------- 2) All canon modules must exist ----------
const requiredModules = [
  "types.ts",
  "invariants.ts",
  "optr.ts",
  "promotion.ts",
  "promote.ts",
  "nonInterference.ts",
  "execution.ts",
  "migration.ts",
  "runtime.ts",
  "index.ts",
];

for (const mod of requiredModules) {
  const modPath = path.join(ROOT, "packages/canon/src", mod);
  requireFile(modPath);
}

// ---------- 3) Canon index must export all modules ----------
const canonIndexPath = path.join(ROOT, "packages/canon/src/index.ts");
const canonIndex = readFile(canonIndexPath);

const requiredExports = [
  "types",
  "invariants",
  "optr",
  "promotion",
  "promote",
  "nonInterference",
  "execution",
  "migration",
  "runtime",
];

for (const exp of requiredExports) {
  assert(
    canonIndex.includes(`from "./${exp}"`),
    `Canon index must export ${exp} module`
  );
}

// Version must be defined
assert(
  canonIndex.includes("BICKFORD_CANON_VERSION"),
  "Canon index must export BICKFORD_CANON_VERSION"
);

// ---------- 4) Core must export canon and runtime ----------
const coreIndexPath = path.join(ROOT, "packages/core/src/index.ts");
requireFile(coreIndexPath);

const coreIndex = readFile(coreIndexPath);
assert(
  coreIndex.includes('export * as canon from "./canon"'),
  "Core must export canon module"
);

assert(
  coreIndex.includes('export * as runtime from "./runtime"'),
  "Core must export runtime module"
);

// ---------- 5) Promotion gate must have 4 tests ----------
const promotionPath = path.join(ROOT, "packages/canon/src/promotion.ts");
const promotionFile = readFile(promotionPath);

assert(
  promotionFile.includes("resistance") &&
  promotionFile.includes("reproducible") &&
  promotionFile.includes("invariantSafe") &&
  promotionFile.includes("feasibilityImpact"),
  "Promotion gate must enforce 4 tests (A, B, C, D)"
);

// ---------- 6) OPTR must include cached features (upgrade #3) ----------
const optrPath = path.join(ROOT, "packages/canon/src/optr.ts");
const optrFile = readFile(optrPath);

assert(
  optrFile.includes("CandidateFeatures") || optrFile.includes("features"),
  "OPTR must include cached features (upgrade #3)"
);

// ---------- 7) Invariants must include requireCanonRefs ----------
const invariantsPath = path.join(ROOT, "packages/canon/src/invariants.ts");
const invariantsFile = readFile(invariantsPath);

assert(
  invariantsFile.includes("requireCanonRefs"),
  "Invariants must define requireCanonRefs gate (upgrade #1)"
);

// ---------- 8) Types must include WhyNot taxonomy ----------
const typesPath = path.join(ROOT, "packages/canon/src/types.ts");
const typesFile = readFile(typesPath);

assert(
  typesFile.includes("DenialReasonCode") &&
  typesFile.includes("enum"),
  "Types must define DenialReasonCode enum (upgrade #2)"
);

// ---------- 9) Runtime must validate environment ----------
const runtimePath = path.join(ROOT, "packages/canon/src/runtime.ts");
const runtimeFile = readFile(runtimePath);

assert(
  runtimeFile.includes("validateEnvironment") ||
  runtimeFile.includes("assertPrismaRuntime"),
  "Runtime must validate execution environment"
);

// ---------- 10) Execution must gate on mode ----------
const executionPath = path.join(ROOT, "packages/canon/src/execution.ts");
const executionFile = readFile(executionPath);

assert(
  executionFile.includes("mode") && 
  executionFile.includes("replay"),
  "Execution module must gate on execution mode"
);

console.log("✅ All Canon invariants satisfied.\n");
console.log("Invariants enforced:");
console.log("  ✓ Canon package structure complete");
console.log("  ✓ All modules present and exported");
console.log("  ✓ 4-test promotion gate enforced");
console.log("  ✓ OPTR upgrades present (cached features)");
console.log("  ✓ Authority enforcement (requireCanonRefs)");
console.log("  ✓ WhyNot taxonomy stable (DenialReasonCode)");
console.log("  ✓ Runtime environment validation");
console.log("  ✓ Execution mode gating");
