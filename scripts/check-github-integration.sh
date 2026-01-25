#!/bin/bash
# scripts/check-github-integration.sh
# Verifies GitHub API integration and token validity

set -e


if [[ -z "$BICKFORD_REPO_TOKEN" ]]; then
  if [[ -f .bickford-repo-token ]]; then
    export BICKFORD_REPO_TOKEN=$(cat .bickford-repo-token)
  fi
fi

if [[ -z "$BICKFORD_REPO_TOKEN" ]]; then
  echo "❌ BICKFORD_REPO_TOKEN is not set. Please add it to .env or .bickford-repo-token."
  exit 1
fi

echo "🔎 Checking GitHub API token..."
resp=$(curl -s -H "Authorization: Bearer $BICKFORD_REPO_TOKEN" https://api.github.com/user)
if echo "$resp" | grep -q '"login"'; then
  echo "✅ GitHub API token is valid."
else
  echo "❌ GitHub API token is invalid or lacks permissions."
  echo "$resp"
  exit 2
fi

echo "🔎 Checking repo access..."
repo="bickford-technologies-inc/bickford"
resp=$(curl -s -H "Authorization: Bearer $BICKFORD_REPO_TOKEN" "https://api.github.com/repos/$repo/pulls?state=open")
if echo "$resp" | grep -q '"url"'; then
  echo "✅ Able to list open pull requests for $repo."
else
  echo "❌ Unable to access repo or list PRs."
  echo "$resp"
  exit 3
fi

echo "All local GitHub API integration checks passed. If Copilot/MCP backend is still unavailable, contact your platform admin to restore the 'firecrawl' toolset."
