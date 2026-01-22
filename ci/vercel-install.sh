#!/usr/bin/env bash
set -euo pipefail

echo "[DEBUG] pwd=$(pwd)"
echo "[DEBUG] repo root files:"
ls -l
echo "[DEBUG] ci tree:"
ls -lR ci || true
repo_root=""
if git_root=$(git rev-parse --show-toplevel 2>/dev/null); then
  repo_root="$git_root"
else
  repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

guard_path="$repo_root/ci/guards/ENVIRONMENT_PRECONDITION.sh"
if [[ -f "$guard_path" ]]; then
  bash "$guard_path"
else
  echo "[WARN] ENVIRONMENT_PRECONDITION.sh not found at $guard_path"
fi
corepack enable
corepack prepare pnpm@10.28.0 --activate
pnpm install --frozen-lockfile
