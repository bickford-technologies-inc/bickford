# Release Automation & Evidence Pack System

This directory contains scripts for deterministic, auditable releases of bickford.

## Overview

The release system implements "code that closes the deal" by providing:
- Deterministic version stamping
- Cryptographic integrity verification
- Software Bill of Materials (SBOM)
- Transaction-grade evidence packs

## Scripts

### `build-stamp.mjs`
Creates deterministic build stamp embedding version, commit, and timestamp into artifacts.

**Usage:**
```bash
npm run build
```

**Output:** `dist/build-stamp.json`

**Format:**
```json
{
  "product": "bickford",
  "version": "1.0.0",
  "gitSha": "abc123...",
  "gitRef": "v1.0.0",
  "buildTime": "2025-12-20T...",
  "buildSystem": "github-actions",
  "timestampLocked": "2025-12-20T14:07:00-05:00"
}
```

### `release-prep.mjs`
Validates tag version matches `package.json` version.

**Usage:**
```bash
npm run release:prep
```

**Behavior:**
- Exits 0 if no tag (local dev)
- Exits 0 if tag matches package.json
- Exits 1 if mismatch (prevents wrong version shipping)

### `evidence-pack.mjs`
Generates transaction-grade evidence bundle with cryptographic hashes.

**Usage:**
```bash
npm run evidence
```

**Output:** `dist/evidence-pack.json`

**Format:**
```json
{
  "product": "bickford",
  "version": "1.0.0",
  "gitSha": "abc123...",
  "gitRef": "v1.0.0",
  "buildTime": "...",
  "evidenceTime": "...",
  "hashes": {
    "dist/build-stamp.json": "sha256...",
    "dist/sbom.cdx.json": "sha256..."
  },
  "canonicalInvariants": {
    "timestampsMandatory": true,
    "canonPromotionRequired": true,
    "nonInterference": "ΔE[TTV_j | π_i] ≤ 0",
    "trustFirstAuditableDenialTrace": true
  },
  "buyerReadyChecklistPointers": {
    "sbom": "dist/sbom.cdx.json",
    "buildStamp": "dist/build-stamp.json",
    "hashes": "dist/evidence-pack.json",
    "dataroom": "dataroom/",
    "legalDocs": "dataroom/LEGAL/"
  }
}
```

## Release Workflow

### 1. Set Version
```bash
npm version 1.0.0 --no-git-tag-version
```

### 2. Commit Changes
```bash
git add package.json package-lock.json
git commit -m "release: bickford v1.0.0"
```

### 3. Create Tag
```bash
git tag v1.0.0
```

### 4. Push (triggers GitHub Actions)
```bash
git push origin main --tags
```

### 5. Automated Release Process

GitHub Actions workflow (`.github/workflows/release.yml`) automatically:
1. Validates tag matches package.json
2. Generates build stamp
3. Generates SBOM (Software Bill of Materials)
4. Generates evidence pack with cryptographic hashes
5. Creates release notes
6. Uploads assets to GitHub Release:
   - `build-stamp.json`
   - `sbom.cdx.json`
   - `evidence-pack.json`
   - `RELEASE_NOTES.md`

## Verification

Buyers can verify release integrity:

```bash
# Download release assets
wget https://github.com/bickfordd-bit/session-completion-runtime/releases/download/v1.0.0/evidence-pack.json

# Verify hashes match
sha256sum dist/build-stamp.json
# Compare to hash in evidence-pack.json
```

## Evidence Pack Purpose

The evidence pack is **"the code that closes the deal"** - it provides:

1. **Provenance proof**: Exact commit + build time
2. **Integrity verification**: Cryptographic hashes of all artifacts
3. **Canonical invariants**: Core system guarantees
4. **Buyer checklist**: Pointers to all diligence materials

This enables Corp Dev teams to:
- Verify what they're acquiring
- Trace artifacts to source code
- Validate system guarantees
- Access complete documentation

## Math Formula → Code → Evidence

When code is "a math formula from the beginning":
- Code is not the authority; **the invariant is**
- A build becomes a **compiled proof attempt**
- Every release is an **auditable mapping**:
  `Formula (Canon + OPTR) → Executable artifact → Verified behaviors`

The evidence pack bridges **intent** to **verifiable reality**.

## Transaction Readiness

Combined with the data room (`dataroom/`) and legal documents (`dataroom/LEGAL/`), this system provides:

- **Technical verification**: Build stamps + hashes
- **Legal clarity**: Transaction-ready documents
- **Risk mitigation**: Auditable provenance
- **Acquisition speed**: Reduced diligence friction

Target deal parameters:
- Base: $6M-$7M + Earnout: $2M-$3M
- Total potential: $8M-$10M
- Liability capped at purchase price
- Objective milestones with dispute resolution

## Notes

- All scripts are Node.js ESM modules (`.mjs`)
- Scripts are idempotent (safe to re-run)
- Evidence pack requires build stamp to exist first
- SBOM requires `@cyclonedx/cyclonedx-npm` (installed in CI)
