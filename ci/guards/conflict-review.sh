#!/usr/bin/env bash
# MODE: MAX-SAFE · AUDIT-ONLY
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PATTERNS="$ROOT/ci/guards/conflict-patterns.txt"

echo "[guard] conflict-review: scanning workspace"

grep -RIn -f "$PATTERNS" "$ROOT" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="$PATTERNS" \
  --exclude="conflict-review.sh" \
  --exclude="conflict-resolve-head.sh" \
  --exclude="prebuild-invariant.sh" \
  --exclude="no-conflict-markers.yml" \
  && {
    echo "[guard] ❌ merge conflict markers detected"
    exit 1
  }

echo "[guard] ✅ no merge conflict markers found"
