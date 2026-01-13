#!/bin/sh
set -e

echo "🔍 Scanning for illegal cross-package source imports..."

rg "@bickford/.*/src/" \
  packages apps \
  --glob '!**/node_modules/**' \
  --glob '!**/dist/**' \
  || true

echo "✅ Scan complete."
