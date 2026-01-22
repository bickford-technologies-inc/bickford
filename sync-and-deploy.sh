#!/bin/bash
# sync-and-deploy.sh
# 1. Sync local and remote main branch
# 2. Trigger Vercel deployment

set -e

echo "[1/2] Syncing local and remote main branch..."
git fetch origin main
if ! git diff --quiet HEAD origin/main; then
  git merge --ff-only origin/main
  echo "Local branch fast-forwarded to match remote."
else
  echo "Local branch already up to date."
fi

echo "[2/2] Triggering Vercel production deployment..."
npx vercel --prod --yes
