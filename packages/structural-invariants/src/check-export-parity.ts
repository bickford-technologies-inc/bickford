#!/usr/bin/env node
import fs from "fs";
import path from "path";

export async function runCheckExportParity() {
  const pkgs = fs.readdirSync("packages");

  for (const p of pkgs) {
    const idx = path.join("packages", p, "src", "index.ts");
    if (!fs.existsSync(idx)) continue;

    const content = fs.readFileSync(idx, "utf8");
    if (!content.includes("export")) {
      console.error(`❌ ${p} has no public exports`);
      process.exit(1);
    }
  }
}
