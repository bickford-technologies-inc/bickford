#!/usr/bin/env bash
# bickford-repo-structure-optimize.sh
# Automates Bickford monorepo restructuring for canonical chat and package architecture

set -e

echo "🔄 Bickford Monorepo: Optimized Restructuring for Canonical Chat Integration"

# 1. Ensure canonical chat package exists
if [ ! -d "packages/bickford-chat" ]; then
  echo "❌ @bickford/chat package missing. Please scaffold it first."
  exit 1
fi

# 2. Add @bickford/chat as a dependency to all relevant packages
for pkg in packages/*/package.json; do
  if grep -q '"@bickford/chat"' "$pkg"; then
    echo "✅ @bickford/chat already in $pkg"
  else
    jq '.dependencies["@bickford/chat"]="workspace:*"' "$pkg" > tmp.$$.json && mv tmp.$$.json "$pkg"
    echo "➕ Added @bickford/chat to $pkg"
  fi
done

# 3. Remove local chat type definitions and point to canonical types
find packages -type f -name "chat-types.ts" -exec bash -c '
  f="$1"
  echo "// DEPRECATED: Use @bickford/chat types instead." > "$f"
  echo "export * from \"@bickford/chat\";" >> "$f"
  echo "🔁 Replaced $f with canonical type re-export"
' bash {} \;

# 4. Insert adapter import and usage notes in all chat-related files
for f in $(grep -rl "import.*chat-types" packages/); do
  sed -i '1i\// NOTE: This file now uses canonical types from @bickford/chat via bickford-chat-adapter\nimport { toCanonicalMessage, fromCanonicalMessage } from "../bickford-chat-adapter";' "$f"
  echo "🔁 Updated $f for canonical chat integration"
done

# 5. Ensure all packages build and test
pnpm install
pnpm build
pnpm test

echo "✅ Bickford monorepo is now fully restructured for canonical, enterprise-wide chat integration."
