#!/usr/bin/env bash
set -e

echo "========================================"
echo "BICKFORD – FULL BUILD ERROR FIX SCRIPT"
echo "========================================"

echo ""
echo "Step 1: Reset known problematic files to canonical state"

git checkout HEAD -- packages/types/src/deniedDecision.ts || true
git checkout HEAD -- packages/canon/src/canon/denials/persistDeniedDecision.ts || true
git checkout HEAD -- packages/canon/src/index.ts || true

echo ""
echo "Step 2: Reinstall dependencies cleanly"
pnpm install

echo ""
echo "Step 3: Run TypeScript build"
pnpm build

echo ""
echo "========================================"
echo "Expected result: Clean build with no TypeScript errors"
echo "========================================"
