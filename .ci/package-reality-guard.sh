#!/usr/bin/env bash
set -euo pipefail

fail=0

for pkg in packages/*; do
  [ -d "$pkg" ] || continue

  if [ ! -f "$pkg/package.json" ]; then
    continue
  fi

  name=$(jq -r '.name // empty' "$pkg/package.json")
  [ -n "$name" ] || continue

  main=$(jq -r '.main // empty' "$pkg/package.json")
  types=$(jq -r '.types // empty' "$pkg/package.json")

  if [[ -z "$main" || -z "$types" ]]; then
    echo "❌ $name missing main/types"
    fail=1
    continue
  fi

  if [[ ! -f "$pkg/$main" || ! -f "$pkg/$types" ]]; then
    echo "❌ $name missing emitted artifacts ($main / $types)"
    fail=1
  fi

done

exit $fail
