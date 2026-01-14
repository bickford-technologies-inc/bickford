import fs from "fs";
import path from "path";

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

/* -----------------------------
   EXECUTION DISPATCH
-------------------------------- */

export function applyFix(failureClass: string) {
  switch (failureClass) {
    case "PRISMA_CLIENT_TYPE_EXPORT_MISSING":
      fixPrismaClientTypeExport();
      return;

    case "CANON_EXPORT_VIOLATION":
      fixCanonExportViolation();
      return;

    case "STAR_EXPORT_CONFLICT":
      fixStarExportConflict();
      return;

    case "PRISMA_EAGER_INIT":
      fixPrismaEagerInit();
      return;

    default:
      throw new Error("No executable fix for failure class: " + failureClass);
  }
}

/* -----------------------------
   CLI ENTRY
-------------------------------- */

if (require.main === module) {
  const error = JSON.parse(fs.readFileSync("error.json", "utf8"));
  applyFix(error.failureClass);
}
