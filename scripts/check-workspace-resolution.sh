#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Scanning for unresolved workspace module usage..."

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

echo "— Searching for unresolved module errors in repo —"
rg "Cannot find module '@bickford/|Module not found: Can't resolve '@bickford/" . || true

echo "— Enumerating workspace packages —"
WORKSPACES=$(jq -r '.workspaces[]' package.json)

FAIL=0

for WS in $WORKSPACES; do
  PKG="$ROOT/$WS"
  [ -f "$PKG/package.json" ] || continue

  NAME=$(jq -r '.name // empty' "$PKG/package.json")
  [ -z "$NAME" ] && continue

  echo ""
  echo "🔎 Checking $NAME ($WS)"

  MAIN=$(jq -r '.main // empty' "$PKG/package.json")
  TYPES=$(jq -r '.types // empty' "$PKG/package.json")
  EXPORTS=$(jq -r '.exports // empty' "$PKG/package.json")

  if [[ -z "$MAIN" || -z "$TYPES" || "$EXPORTS" == "null" ]]; then
    echo "❌ package.json missing main/types/exports"
    FAIL=1
  fi

  if [[ ! -d "$PKG/dist" ]]; then
    echo "❌ dist/ directory missing"
    FAIL=1
  else
    if [[ ! -f "$PKG/dist/index.js" ]]; then
      echo "❌ dist/index.js missing"
      FAIL=1
    fi
    if [[ ! -f "$PKG/dist/index.d.ts" ]]; then
      echo "❌ dist/index.d.ts missing"
      FAIL=1
    fi
  fi

done

if [[ "$FAIL" -eq 1 ]]; then
  echo ""
  echo "🚫 WORKSPACE RESOLUTION CHECK FAILED"
  echo "Fix packages above before running Next.js build."
  exit 1
fi

echo ""
echo "✅ Workspace resolution invariant satisfied"
