#!/usr/bin/env bash
set -e

echo "🔒 Vite entry guard running..."

INDEX="packages/web-ui/index.html"
ENTRY="src/main.tsx"

# 1. index.html must exist
if [ ! -f "$INDEX" ]; then
  echo "❌ index.html missing"
  exit 1
fi

# 2. index.html must load main.tsx
if ! grep -q 'src="/src/main.tsx"' "$INDEX"; then
  echo "❌ index.html does not load /src/main.tsx"
  exit 1
fi

# 3. main.tsx must mount React
if ! grep -q 'createRoot' packages/web-ui/src/main.tsx; then
  echo "❌ main.tsx does not mount React (createRoot missing)"
  exit 1
fi

if ! grep -q '.render' packages/web-ui/src/main.tsx; then
  echo "❌ main.tsx does not call render()"
  exit 1
fi

echo "✅ Vite entry invariant satisfied"
