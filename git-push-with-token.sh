#!/bin/bash
# Automated push to GitHub using a provided Personal Access Token (PAT)
# Usage: ./git-push-with-token.sh <token>

set -e

REPO_URL="github.com/bickford-technologies-inc/bickford.git"
TOKEN="$1"

if [ -z "$TOKEN" ]; then
  echo "Usage: $0 <github_token>"
  exit 1
fi

# Set the remote URL to use the token
REMOTE_URL="https://x-access-token:${TOKEN}@${REPO_URL}"
git remote set-url origin "$REMOTE_URL"

echo "Pushing to GitHub using provided token..."
git push

# Restore the remote URL to the default (no token in config)
git remote set-url origin "https://${REPO_URL}"
echo "Push complete and remote URL restored."
