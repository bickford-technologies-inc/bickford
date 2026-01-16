#!/usr/bin/env bash
set -euo pipefail

# -------- CONFIG --------
GUARD_PATH="ci/guards/ENVIRONMENT_PRECONDITION.sh"
DIAG_OUT="build-diagnosis.json"
STAGE="install"
EXECUTOR="vercel"
SEVERITY="hard-stop"
FAILURE_TYPE="missing_execution_guard"
EXIT_CODE=127
# ------------------------

TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
COMMIT_SHA="${VERCEL_GIT_COMMIT_SHA:-unknown}"
BRANCH="${VERCEL_GIT_COMMIT_REF:-unknown}"
REGION="${VERCEL_REGION:-unknown}"

emit_diagnosis() {
  cat > "$DIAG_OUT" <<EOF
{
  "schema": "bickford.build-diagnosis.v1",
  "timestamp": "$TIMESTAMP",
  "failure": {
    "type": "$FAILURE_TYPE",
    "severity": "$SEVERITY",
    "exit_code": $EXIT_CODE,
    "stage": "$STAGE",
    "executor": "$EXECUTOR"
  },
  "root_cause": {
    "classification": "missing_file",
    "path": "$GUARD_PATH",
    "description": "Referenced execution guard does not exist at expected path"
  },
  "canonical_interpretation": {
    "result": "enforcement_success",
    "reason": "Execution halted before entering undefined environment state"
  },
  "prescribed_remediation": [
    {
      "action": "restore_guard",
      "path": "$GUARD_PATH",
      "description": "Create the missing guard script and commit it"
    },
    {
      "action": "update_reference",
      "description": "Remove or correct the guard reference if deprecated"
    }
  ],
  "environment": {
    "commit": "$COMMIT_SHA",
    "branch": "$BRANCH",
    "region": "$REGION"
  }
}
EOF
}

if [[ ! -f "$GUARD_PATH" ]]; then
  echo "[ENFORCEMENT] Missing guard: $GUARD_PATH"
  emit_diagnosis
  exit $EXIT_CODE
fi

if [[ ! -x "$GUARD_PATH" ]]; then
  echo "[ENFORCEMENT] Guard exists but is not executable: $GUARD_PATH"
  emit_diagnosis
  exit $EXIT_CODE
fi

echo "[ENFORCEMENT] All required guards present"
