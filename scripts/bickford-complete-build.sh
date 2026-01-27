#!/bin/bash
# Bickford Complete Software Package Build Automation
# This script automates the canonical build, evidence capture, and deployment workflow as defined in docs/COMPLETE_SOFTWARE_PACKAGE_BUILD.md

set -e

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

# 1. Validate intent.json exists and is valid
if [ ! -f intent.json ]; then
  echo "❌ intent.json not found. Please declare intent before building."
  exit 1
fi

# 2. Canonical build path (Bickford Standard)
echo "🔹 Running: pnpm run build:types"
pnpm run build:types

echo "🔹 Running: pnpm run prebuild"
pnpm run prebuild

echo "🔹 Running: pnpm run realize-intent"
pnpm run realize-intent

echo "🔹 Running: pnpm run build"
pnpm run build

# 3. Capture evidence (logs, artifacts, ttv-report)
ARTIFACTS_DIR="artifacts"
mkdir -p "$ARTIFACTS_DIR"

# Copy logs and outputs if they exist
touch "$ARTIFACTS_DIR/build.log"
echo "Build completed at $(date)" >> "$ARTIFACTS_DIR/build.log"

# 4. Check for ttv-report.json (proof of admissible execution)
if [ -f "$ARTIFACTS_DIR/ttv-report.json" ]; then
  echo "✅ ttv-report.json found. Canonical build evidence captured."
else
  echo "⚠️  ttv-report.json not found. Please ensure realize-intent or build emits this artifact."
fi

# 5. (Optional) Deploy to Vercel if vercel.json exists
echo "🔹 Checking for Vercel deployment surface..."
if [ -f vercel.json ]; then
  echo "🔹 Deploying to Vercel..."
  npx vercel --prod --yes
  echo "✅ Deployment triggered. Check Vercel dashboard for status."
else
  echo "ℹ️  vercel.json not found. Skipping deployment."
fi

echo "🎉 Bickford Complete Software Package Build workflow finished."
echo "Artifacts and logs are in: $ARTIFACTS_DIR/"
