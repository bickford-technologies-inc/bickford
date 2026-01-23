#!/usr/bin/env bash
# MODE: MAX-SAFE · MECHANICAL
# STRATEGY: KEEP THEIRS (incoming)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PATTERNS="$ROOT/ci/guards/conflict-patterns.txt"

echo "[guard] conflict-resolve: THEIRS-only"

FILES=$(grep -RIl -f "$PATTERNS" "$ROOT" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="$PATTERNS" \
  --exclude="conflict-review.sh" \
  --exclude="conflict-resolve-head.sh" \
  --exclude="conflict-resolve-theirs.sh" \
  --exclude="prebuild-invariant.sh" \
  --exclude="no-conflict-markers.yml" \
  || true)

[[ -z "$FILES" ]] && {
  echo "[guard] nothing to resolve"
  exit 0
}

for f in $FILES; do
  echo "[guard] resolving $f"
  awk '
    BEGIN { keep=0 }
    /^[<]{7}/ { keep=0; next }
    /^[=]{7}/ { keep=1; next }
    /^[>]{7}/ { keep=0; next }
    keep { print }
  ' "$f" > "$f.__resolved__"
  mv "$f.__resolved__" "$f"
done

echo "[guard] conflict resolution complete"
