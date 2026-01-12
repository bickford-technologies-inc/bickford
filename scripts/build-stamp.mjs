#!/usr/bin/env node
/**
 * Build Stamp Generator
 * 
 * Creates a deterministic build stamp that embeds version, commit, and timestamp
 * into the build artifact. This enables buyer verification of exact provenance.
 * 
 * Timestamp: 2025-12-20T14:07:00-05:00
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;

const gitSha = execSync("git rev-parse HEAD").toString().trim();
const gitRef = (process.env.GITHUB_REF_NAME || "").trim();
const buildTime = new Date().toISOString();

const stamp = {
  product: "bickford",
  version,                // vX.Y.Z lives here (source of truth)
  gitSha,                 // exact commit
  gitRef,                 // tag or branch
  buildTime,              // timestamp
  buildSystem: "github-actions",
  timestampLocked: "2025-12-20T14:07:00-05:00"
};

fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync(path.join("dist", "build-stamp.json"), JSON.stringify(stamp, null, 2));

console.log("✓ Build stamp created:");
console.log(JSON.stringify(stamp, null, 2));
