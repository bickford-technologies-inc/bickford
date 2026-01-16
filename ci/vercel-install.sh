#!/usr/bin/env bash
set -euo pipefail

echo "[DEBUG] pwd=$(pwd)"
echo "[DEBUG] repo root files:"
ls -l
echo "[DEBUG] ci tree:"
ls -lR ci || true
bash "$(git rev-parse --show-toplevel)/ci/guards/ENVIRONMENT_PRECONDITION.sh"
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install --frozen-lockfile
