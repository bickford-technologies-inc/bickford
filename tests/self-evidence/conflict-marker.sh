#!/usr/bin/env bash
set -euo pipefail

tmp=".tmp_conflict_test"
echo "<<<<<<< HEAD" > "$tmp"

if ./ci/guards/conflict-review.sh >/dev/null 2>&1; then
  echo "❌ Conflict marker test FAILED (should have halted)"
  rm "$tmp"
  exit 1
fi

rm "$tmp"
echo "✅ Conflict marker invariant is self-evident"
