#!/usr/bin/env node
// scripts/check-types-parity.js
// Ensures all workspace packages using react/react-dom have matching @types/* devDependencies.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pkgsDir = path.join(root, "packages");
const demoDirs = ["demo-dashboard", "web-ui", "bickford-mobile-ui", "ui"];
const reactPkgs = ["react", "react-dom"];
const typePkgs = ["@types/react", "@types/react-dom"];

function getAllPackages() {
  return fs
    .readdirSync(pkgsDir)
    .filter((f) => fs.existsSync(path.join(pkgsDir, f, "package.json")));
}

function usesReact(pkgDir) {
  const srcDir = path.join(pkgDir, "src");
  if (!fs.existsSync(srcDir)) return false;
  const files = fs
    .readdirSync(srcDir)
    .filter(
      (f) => f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".tsx")
    );
  return files.some((file) => {
    const content = fs.readFileSync(path.join(srcDir, file), "utf8");
    return (
      content.includes('from "react"') ||
      content.includes('from "react-dom"') ||
      content.includes("from " + "'react'") ||
      content.includes("from " + "'react-dom'")
    );
  });
}

function checkTypes(pkgName) {
  const pkgPath = path.join(pkgsDir, pkgName, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const devDeps = pkg.devDependencies || {};
  const deps = pkg.dependencies || {};
  let missing = [];
  if (deps["react"] && !devDeps["@types/react"]) missing.push("@types/react");
  if (deps["react-dom"] && !devDeps["@types/react-dom"])
    missing.push("@types/react-dom");
  return missing;
}

let failed = false;
for (const pkgName of getAllPackages()) {
  const pkgDir = path.join(pkgsDir, pkgName);
  if (usesReact(pkgDir)) {
    const missing = checkTypes(pkgName);
    if (missing.length) {
      console.error(`❌ ${pkgName} is missing: ${missing.join(", ")}`);
      failed = true;
    } else {
      console.log(`✅ ${pkgName} has all required @types/* devDependencies.`);
    }
  }
}
if (failed) {
  process.exit(1);
} else {
  console.log("All React-using packages have type parity.");
}
