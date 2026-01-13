/**
 * Fix Agent — Mechanical Repairs Only
 * TIMESTAMP: 2026-02-08T00:00:00Z
 */

import { execSync } from "child_process";

export function applyFix(type: string) {
  if (type === "missing-types")
    execSync("npm i -D @types/react-dom", { stdio: "inherit" });
  if (type === "schema-invalid")
    execSync("npx prisma generate", { stdio: "inherit" });
  if (type === "merge-corruption")
    throw new Error("Merge corruption should never reach fix agent");
}
