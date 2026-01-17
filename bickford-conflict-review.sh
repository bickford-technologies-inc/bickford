#!/usr/bin/env bash
# bickford-conflict-review.sh
# PURPOSE: Deterministically review all pending changes and ensure
#          no conflicts, merge markers, or invariant violations exist.
# MODE: MAX-SAFE · NON-DESTRUCTIVE · READ-ONLY
# EXIT CODES:
#   0 = SAFE (no conflicts detected)
#   1 = HARD FAIL (conflicts or invariant violations found)

set -euo pipefail

echo "=== BICKFORD MAX-SAFE REVIEW: START ==="

FAIL=0

################################################################################
# 1. Ensure working tree is cleanly reviewable
################################################################################
echo "--- Checking git status (non-destructive) ---"
git status --porcelain=v1 > /tmp/bickford_status.txt || true

if [[ -s /tmp/bickford_status.txt ]]; then
  echo "INFO: Pending changes detected:"
  cat /tmp/bickford_status.txt
else
  echo "OK: No pending changes (clean working tree)."
fi

################################################################################
# 2. Detect unresolved merge conflict markers
################################################################################
echo "--- Scanning for merge conflict markers ---"
# Split the pattern to avoid self-detection
CONFLICTS=$(grep -RIn -e '<<'"<<<<< ' -e '=======' -e '>>'">>>>> ' --exclude-dir=node_modules --exclude-dir=.git --exclude=bickford-conflict-review.sh --exclude=ci/guards/conflict-review.sh --exclude=ci/guards/conflict-resolve-head.sh --exclude=.github/workflows/no-conflict-markers.yml . || true)

if [[ -n "$CONFLICTS" ]]; then
  echo "ERROR: Merge conflict markers found:"
  echo "$CONFLICTS"
  FAIL=1
else
  echo "OK: No merge conflict markers detected."
fi

################################################################################
# 3. Verify required source files exist
################################################################################
echo "--- Verifying required canonical source files ---"

REQUIRED_FILES=(
  "packages/types/src/ExecutionAdapter.ts"
  "packages/canon/src/Action.ts"
  "packages/canon/src/Decision.ts"
  "packages/canon/src/Denial.ts"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "ERROR: Missing required file: $f"
    FAIL=1
  else
    echo "OK: Found $f"
  fi
done

################################################################################
# 4. Verify required exports exist (syntax-level)
################################################################################
echo "--- Verifying required exports ---"

declare -A EXPORTS
EXPORTS["packages/types/src/ExecutionAdapter.ts"]="ExecutionAdapter"
EXPORTS["packages/canon/src/Action.ts"]="Action"
EXPORTS["packages/canon/src/Decision.ts"]="Decision"
EXPORTS["packages/canon/src/Denial.ts"]="Denial"

for file in "${!EXPORTS[@]}"; do
  symbol="${EXPORTS[$file]}"
  if [[ -f "$file" ]]; then
    if ! grep -Eq "export (interface|type|class|function) ${symbol}\b" "$file"; then
      echo "ERROR: $file does not export symbol '${symbol}'"
      FAIL=1
    else
      echo "OK: $file exports ${symbol}"
    fi
  fi
done

################################################################################
# 5. Check for invalid deep imports across packages
################################################################################
echo "--- Checking for invalid deep imports (@bickford/*/src) ---"

DEEP_IMPORTS=$(grep -RIn \
  -e '@bickford/[^\"]+/src' \
  -e '@bickford/[^\"]+/' \
  packages \
  | grep -v '@bickford/types"' \
  | grep -v '@bickford/canon"' \
  | grep -v '@bickford/db"' \
  || true)

if [[ -n "$DEEP_IMPORTS" ]]; then
  echo "ERROR: Potential deep imports detected:"
  echo "$DEEP_IMPORTS"
  FAIL=1
else
  echo "OK: No illegal deep imports detected."
fi

################################################################################
# 6. TypeScript surface sanity check (no emit)
################################################################################
echo "--- TypeScript surface sanity check (no emit) ---"
if ! pnpm -w exec tsc --noEmit --pretty false >/tmp/bickford-tsc.log 2>&1; then
  echo "ERROR: TypeScript surface check failed:"
  cat /tmp/bickford-tsc.log
  FAIL=1
else
  echo "OK: TypeScript surface is consistent."
fi

################################################################################
# 7. Final verdict
################################################################################
echo "=== BICKFORD MAX-SAFE REVIEW: COMPLETE ==="

if [[ "$FAIL" -eq 1 ]]; then
  echo "RESULT: ❌ CONFLICTS OR VIOLATIONS DETECTED"
  exit 1
else
  echo "RESULT: ✅ SAFE TO CONTINUE (NO CONFLICTS)"
  exit 0
fi
