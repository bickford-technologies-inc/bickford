#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PKG_DIR = path.join(ROOT, "packages");
const errors = [];

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

const packages = fs
  .readdirSync(PKG_DIR)
  .filter((d) => exists(path.join(PKG_DIR, d, "package.json")));

for (const pkg of packages) {
  const pkgPath = path.join(PKG_DIR, pkg);
  const pkgJson = readJSON(path.join(pkgPath, "package.json"));
  const name = pkgJson.name;

  if (!name?.startsWith("@bickford/")) continue;

  const dist = path.join(pkgPath, "dist");
  const main = pkgJson.main;
  const types = pkgJson.types;
  const exportsField = pkgJson.exports?.["."];

  if (!exists(dist)) {
    errors.push(`${name}: missing dist/`);
  }

  if (!main || !exists(path.join(pkgPath, main))) {
    errors.push(`${name}: invalid or missing main`);
  }

  if (!types || !exists(path.join(pkgPath, types))) {
    errors.push(`${name}: invalid or missing types`);
  }

  if (!exportsField?.default || !exportsField?.types) {
    errors.push(`${name}: missing exports "."`);
  }
}

if (errors.length) {
  console.error("\n❌ PREFLIGHT FAILED\n");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}

console.log("✅ Prefight OK — all workspace packages emit dist + exports");
