#!/bin/bash
# retry-auto-merge.sh: Continuously attempts to auto-approve and auto-merge all open PRs on GitHub
# Usage: ./retry-auto-merge.sh [repo] [interval_seconds]
# Example: ./retry-auto-merge.sh bickford-technologies-inc/bickford 60

REPO="${1:-bickford-technologies-inc/bickford}"
INTERVAL="${2:-60}"

echo "[INFO] Starting continuous auto-merge for $REPO (interval: $INTERVAL seconds)"

while true; do
  echo "[INFO] Checking open PRs..."
  prs=$(gh pr list -R "$REPO" --state open --json number --jq '.[].number')
  for pr in $prs; do
    echo "[INFO] Attempting auto-approve and auto-merge for PR #$pr"
    gh pr review $pr -R "$REPO" --approve || true
    gh pr merge $pr -R "$REPO" --auto --squash || true
  done
  echo "[INFO] Sleeping for $INTERVAL seconds..."
  sleep "$INTERVAL"
done
