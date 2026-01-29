#!/bin/bash
# runner-preflight-check.sh
# Pre-flight check for self-hosted runner token validity (GitHub Actions example)
# Usage: ./runner-preflight-check.sh <OWNER> <REPO> <TOKEN>

set -e

OWNER="$1"
REPO="$2"
TOKEN="$3"

if [[ -z "$OWNER" || -z "$REPO" || -z "$TOKEN" ]]; then
  echo "Usage: $0 <OWNER> <REPO> <TOKEN>"
  exit 1
fi

# Validate the token by requesting a registration token from GitHub API
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/actions/runners/registration-token")

if [[ "$RESPONSE" == "201" ]]; then
  echo "[PASS] Runner token is valid."
  exit 0
else
  echo "[FAIL] Runner token is INVALID or expired (HTTP $RESPONSE)."
  exit 2
fi
