#!/usr/bin/env bash
set -e

echo "🔒 Vite entry guard running..."

INDEX="packages/web-ui/index.html"
ENTRY="packages/web-ui/src/main.tsx"

# index.html must exist
if [ ! -f "$INDEX" ]; then
  echo "❌ index.html missing"
  exit 1
fi

# index.html must load main.tsx
if ! grep -q 'src="/src/main.tsx"' "$INDEX"; then
  echo "❌ index.html does not load /src/main.tsx"
  exit 1
fi

# main.tsx must exist
if [ ! -f "$ENTRY" ]; then
  echo "❌ src/main.tsx missing"
  exit 1
fi

# main.tsx must mount React
if ! grep -q 'createRoot' "$ENTRY"; then
  echo "❌ createRoot missing in main.tsx"
  exit 1
fi

if ! grep -q '\.render' "$ENTRY"; then
  echo "❌ render() not called in main.tsx"
  exit 1
fi

echo "✅ Vite entry invariant satisfied"
