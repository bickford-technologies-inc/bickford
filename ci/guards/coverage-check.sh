#!/usr/bin/env bash
set -euo pipefail

INVARIANTS="ci/invariants.json"
GUARDS_DIR="ci/guards"

missing=0

for key in $(jq -r 'keys[]' "$INVARIANTS"); do
  guard="$GUARDS_DIR/$key.sh"
  if [[ ! -f "$guard" ]]; then
    echo "❌ Missing guard for invariant: $key ($guard)"
    missing=1
  fi
done

if [[ "$missing" -eq 1 ]]; then
  echo "Invariant coverage incomplete. Halting."
  exit 1
fi
