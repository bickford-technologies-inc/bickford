#!/usr/bin/env bash
set -euxo pipefail

trap 'echo "[ERROR] Script failed at line $LINENO with exit code $?"' ERR

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
pnpm install --frozen-lockfile

# Ensure DATABASE_URL is set for Prisma (Vercel build)
export DATABASE_URL=${DATABASE_URL:-"file:./dev.db"}
if [[ -f "packages/ledger/prisma/schema.prisma" ]]; then
  pnpm exec prisma generate --schema=packages/ledger/prisma/schema.prisma
else
  echo "[INFO] Skipping prisma generate: schema.prisma not found."
fi
