import fs from "fs";
import path from "path";
import { recordMetric } from "./ci/metrics";

function removeLine(file: string, line: string) {
  if (!fs.existsSync(file)) return false;
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes(line)) return false;
  content = content.replace(line, "").trim() + "\n";
  fs.writeFileSync(file, content);
  console.log(`✔ removed invalid line from ${file}`);
  return true;
}

/* -----------------------------
   FIX IMPLEMENTATIONS
-------------------------------- */

function fixPrismaClientTypeExport() {
  const files = ["packages/db/src/client.ts", "packages/db/src/index.ts"];
  const badLine = `export type { PrismaClient } from "@prisma/client";`;

  let changed = false;
  for (const file of files) {
    changed ||= removeLine(file, badLine);
  }

  if (!changed) {
    console.log("ℹ no invalid PrismaClient type export found");
  }
}

function fixCanonExportViolation() {
  const file = "packages/canon/src/index.ts";
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, "utf8");
  if (content.includes("export *")) {
    throw new Error("Forbidden wildcard export in canon");
  }
}

function fixStarExportConflict() {
  const file = "packages/core/src/index.ts";
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, "utf8");
  if (content.includes("export * from './optr'")) {
    throw new Error("Star export conflict must be resolved manually");
  }
}

function fixPrismaEagerInit() {
  const dir = "packages/db/src";
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));

  for (const f of files) {
    const file = path.join(dir, f);
    let content = fs.readFileSync(file, "utf8");
    if (content.includes("new PrismaClient(")) {
      throw new Error(`Eager PrismaClient init detected in ${file}`);
    }
  }
}

// --- PRISMA CONTRACT + PURITY AUTO-FIXES ---
function fixLedgerGetPrismaImports() {
  const { execSync } = require("child_process");
  try {
    execSync(
      `rg "getPrisma" apps/web -l | xargs sed -i 's|@bickford/ledger|@bickford/db|g'`,
      { stdio: "inherit" }
    );
    console.log("✔ rewrote getPrisma imports from ledger → db");
  } catch {
    /* no-op */
  }
}

function fixCanonIndexExports() {
  const fs = require("fs");
  const path = "packages/canon/src/index.ts";
  if (!fs.existsSync(path)) return;

  let src = fs.readFileSync(path, "utf8");

  const forbidden = [
    "persistDeniedDecision",
    "DenialReasonCode",
    "requireCanonRefs",
    "optrResolve",
  ];

  forbidden.forEach((token) => {
    src = src
      .split("\n")
      .filter((l) => !l.includes(token))
      .join("\n");
  });

  fs.writeFileSync(path, src.trim() + "\n");
  console.log("✔ removed dead canon re-exports");
}

function fixCorePrismaImports() {
  const { execSync } = require("child_process");
  try {
    execSync(
      `rg "import \\{ prisma \\} from \\\"@bickford/db\\\"" packages/core -l | xargs sed -i 's|import { prisma } from "@bickford/db"|import { getPrisma } from "@bickford/db"|g'`,
      { stdio: "inherit" }
    );
    console.log("✔ replaced prisma imports with getPrisma in core");
  } catch {
    /* no-op */
  }
}

function fixTopLevelGetPrismaCalls() {
  const fs = require("fs");
  const glob = require("glob");

  const files = glob.sync("apps/web/src/app/api/**/route.ts");

  for (const file of files) {
    let src = fs.readFileSync(file, "utf8");

    if (
      src.includes("getPrisma()") &&
      !src.match(/export\s+async\s+function/)
    ) {
      src = src.replace(/const\s+\w+\s*=\s*getPrisma\(\);?/g, "");
      fs.writeFileSync(file, src);
      console.log(`✔ removed top-level getPrisma() from ${file}`);
    }
  }
}

/* -----------------------------
   EXECUTION DISPATCH
-------------------------------- */

export function hasFix(classification) {
  return [
    "PRISMA_CLIENT_TYPE_EXPORT_MISSING",
    "PRISMA_RUNTIME_PURITY_VIOLATION",
    "PRISMA_ILLEGAL_IMPORT",
  ].includes(classification);
}

const oldApplyFix = applyFix;
export function applyFix(classification) {
  recordMetric({ type: "auto_fix", classification });
  switch (classification) {
    case "PRISMA_CLIENT_TYPE_EXPORT_MISSING":
    case "PRISMA_RUNTIME_PURITY_VIOLATION":
    case "PRISMA_ILLEGAL_IMPORT":
      fixLedgerGetPrismaImports();
      fixCanonIndexExports();
      fixCorePrismaImports();
      fixTopLevelGetPrismaCalls();
      break;
    default:
      recordMetric({ type: "blocked", classification });
      oldApplyFix(classification);
      throw new Error(
        `❌ No fix registered for failure class: ${classification}`
      );
  }
}

/* -----------------------------
   CLI ENTRY
-------------------------------- */

if (require.main === module) {
  const error = JSON.parse(fs.readFileSync("error.json", "utf8"));
  applyFix(error.failureClass);
}
