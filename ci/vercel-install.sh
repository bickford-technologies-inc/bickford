#!/usr/bin/env bash
set -euo pipefail

echo "[DEBUG] pwd=$(pwd)"
echo "[DEBUG] repo root files:"
ls -l
echo "[DEBUG] ci tree:"
ls -lR ci || true
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
if [[ -d "$repo_root/.git" ]]; then
  if git_root=$(git -C "$repo_root" rev-parse --show-toplevel 2>/dev/null); then
    if [[ -n "$git_root" ]]; then
      repo_root="$git_root"
    fi
  fi
fi

guard_path="$repo_root/ci/guards/ENVIRONMENT_PRECONDITION.sh"
if [[ ! -f "$guard_path" ]]; then
  guard_path="$script_dir/guards/ENVIRONMENT_PRECONDITION.sh"
fi
if [[ -f "$guard_path" ]]; then
  bash "$guard_path"
else
  echo "[WARN] ENVIRONMENT_PRECONDITION.sh not found at $guard_path"
fi
corepack enable
corepack prepare pnpm@10.28.0 --activate
pnpm approve-builds --all
pnpm install --frozen-lockfile
pnpm exec prisma generate --schema=packages/ledger/prisma/schema.prisma
