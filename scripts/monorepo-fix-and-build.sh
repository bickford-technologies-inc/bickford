#!/bin/bash
set -e

echo "Step 1: Cleaning node_modules and dist directories..."
find . -type d -name 'node_modules' -prune -exec rm -rf '{}' +
find . -type d -name 'dist' -prune -exec rm -rf '{}' +

echo "Step 2: Checking @bickford/core/package.json for @bickford/canon dependency..."
core_pkg="packages/core/package.json"
canon_pkg="packages/bickford/package.json"

if ! grep -q '"@bickford/canon"' "$core_pkg"; then
  echo "  Fixing: Adding @bickford/canon to dependencies"
  jq '.dependencies["@bickford/canon"] = "*"' "$core_pkg" > "$core_pkg.tmp" && mv "$core_pkg.tmp" "$core_pkg"
  git add "$core_pkg"
else
  echo "  @bickford/canon already present in core dependencies."
fi

echo "Step 3: Verifying @bickford/canon (packages/bickford) main/types fields..."
if [ -f "$canon_pkg" ]; then
  needs_update=0
  main_field=$(jq -r '.main // empty' "$canon_pkg")
  types_field=$(jq -r '.types // empty' "$canon_pkg")
  if [ "$main_field" != "dist/index.js" ]; then
    jq '.main = "dist/index.js"' "$canon_pkg" > "$canon_pkg.tmp" && mv "$canon_pkg.tmp" "$canon_pkg"
    needs_update=1
  fi
  if [ "$types_field" != "dist/index.d.ts" ]; then
    jq '.types = "dist/index.d.ts"' "$canon_pkg" > "$canon_pkg.tmp" && mv "$canon_pkg.tmp" "$canon_pkg"
    needs_update=1
  fi
  if [ $needs_update -eq 1 ]; then
    echo "  Fixed: Updated main/types fields in @bickford/canon (packages/bickford)"
    git add "$canon_pkg"
  else
    echo "  main/types fields correct in @bickford/canon (packages/bickford)"
  fi
else
  echo "  Warning: packages/bickford/package.json not found – skip main/types check."
fi

echo "Step 4: Installing dependencies..."
bash ci/guards/ENVIRONMENT_PRECONDITION.sh && corepack enable && corepack prepare pnpm@9.15.0 --activate && pnpm install --frozen-lockfile

echo "Step 5: Running monorepo build..."
pnpm exec turbo run build

if git diff --cached --quiet; then
  echo "No changes made to package.json files – nothing to commit."
else
  git commit -m "fix(monorepo): align canon automation with actual package path"
  echo "Committed any applied fixes."
fi

echo "✅ All done. If build succeeded, deployment is now unblocked."
