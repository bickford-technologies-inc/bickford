#!/usr/bin/env node
/**
 * Evidence Pack Generator
 * 
 * Creates transaction-grade evidence bundle with:
 * - Build stamp
 * - Cryptographic hashes
 * - SBOM reference
 * - Canonical invariants
 * - Buyer verification checklist
 * 
 * This is the "code that closes the deal" - it provides auditable proof
 * of what's being acquired.
 * 
 * Timestamp: 2025-12-20T14:07:00-05:00
 */

import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function listFilesRecursive(dir) {
  const out = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...listFilesRecursive(p));
      else out.push(p);
    }
  } catch (err) {
    // Directory doesn't exist, skip
  }
  return out;
}

fs.mkdirSync("dist", { recursive: true });

// Ensure build stamp exists
if (!fs.existsSync("dist/build-stamp.json")) {
  throw new Error("dist/build-stamp.json missing. Run build-stamp first.");
}

const stamp = JSON.parse(fs.readFileSync("dist/build-stamp.json", "utf8"));

const filesToHash = [
  "dist/build-stamp.json",
  "dist/sbom.cdx.json"
].filter(fs.existsSync);

const hashes = {};
for (const f of filesToHash) hashes[f] = sha256File(f);

// Also hash any release artifacts you drop into dist/release-artifacts
const artifactsDir = "dist/release-artifacts";
if (fs.existsSync(artifactsDir)) {
  for (const f of listFilesRecursive(artifactsDir)) {
    hashes[f] = sha256File(f);
  }
}

const evidence = {
  product: "bickford",
  version: stamp.version,
  gitSha: stamp.gitSha,
  gitRef: stamp.gitRef,
  buildTime: stamp.buildTime,
  evidenceTime: new Date().toISOString(),
  hashes,
  canonicalInvariants: {
    timestampsMandatory: true,
    canonPromotionRequired: true,
    nonInterference: "ΔE[TTV_j | π_i] ≤ 0",
    trustFirstAuditableDenialTrace: true
  },
  buyerReadyChecklistPointers: {
    sbom: "dist/sbom.cdx.json",
    buildStamp: "dist/build-stamp.json",
    hashes: "dist/evidence-pack.json",
    dataroom: "dataroom/",
    legalDocs: "dataroom/LEGAL/"
  }
};

fs.writeFileSync("dist/evidence-pack.json", JSON.stringify(evidence, null, 2));
console.log("✓ Wrote dist/evidence-pack.json");
console.log(`  Version: ${evidence.version}`);
console.log(`  Git SHA: ${evidence.gitSha}`);
console.log(`  Hashed ${Object.keys(hashes).length} files`);
