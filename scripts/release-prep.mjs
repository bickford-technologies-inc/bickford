#!/usr/bin/env node
/**
 * Release Preparation Validator
 * 
 * Ensures tag version matches package.json version.
 * Prevents "wrong version shipped" by failing CI on mismatch.
 * 
 * Timestamp: 2025-12-20T14:07:00-05:00
 */

import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const pkgVersion = pkg.version;

const ref = (process.env.GITHUB_REF_NAME || "").trim(); // e.g. v1.2.3
const tagVersion = ref.startsWith("v") ? ref.slice(1) : ref;

if (!ref) {
  console.log("ℹ No GITHUB_REF_NAME found; skipping release prep.");
  process.exit(0);
}

if (tagVersion !== pkgVersion) {
  console.error(
    `❌ VERSION MISMATCH:\n` +
    `  tag:         ${ref}\n` +
    `  package.json ${pkgVersion}\n\n` +
    `Fix by setting package.json version to ${tagVersion} before tagging.`
  );
  process.exit(1);
}

console.log(`✓ Release prep OK: tag ${ref} matches package.json ${pkgVersion}`);
