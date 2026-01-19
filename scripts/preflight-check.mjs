#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function fail(msg) {
  console.error(`\n❌ PREFLIGHT FAILED\n${msg}\n`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✔ ${msg}`);
}

/* ------------------------------------------------------------------ */
/* CHECK 1 — TSC AVAILABILITY                                          */
/* ------------------------------------------------------------------ */
const tsc = spawnSync("pnpm", ["exec", "tsc", "--version"], {
  stdio: "ignore",
});

if (tsc.status !== 0) {
  fail("TypeScript compiler (tsc) not available via pnpm exec");
}
ok("tsc available");

/* ------------------------------------------------------------------ */
/* CHECK 2 — WORKSPACE PACKAGE INVARIANTS                              */
/* ------------------------------------------------------------------ */
const root = process.cwd();
const packagesDir = path.join(root, "packages");

for (const pkg of fs.readdirSync(packagesDir)) {
  const pkgPath = path.join(packagesDir, pkg);
  const pkgJsonPath = path.join(pkgPath, "package.json");
  const distPath = path.join(pkgPath, "dist");

  if (!fs.existsSync(pkgJsonPath)) continue;

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

  if (!pkgJson.name?.startsWith("@bickford/")) continue;

  if (!fs.existsSync(distPath)) {
    fail(`${pkgJson.name}: missing dist/`);
  }

  if (!pkgJson.main || !fs.existsSync(path.join(pkgPath, pkgJson.main))) {
    fail(`${pkgJson.name}: invalid or missing main`);
  }

  if (!pkgJson.types || !fs.existsSync(path.join(pkgPath, pkgJson.types))) {
    fail(`${pkgJson.name}: invalid or missing types`);
  }

  if (!pkgJson.exports?.["."]) {
    fail(`${pkgJson.name}: missing exports "."`);
  }

  ok(`${pkgJson.name} invariant OK`);
}

console.log("\n✅ PREFLIGHT PASSED\n");
