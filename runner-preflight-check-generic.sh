#!/bin/bash
# runner-preflight-check-generic.sh
# Pre-flight check for CI/CD runner tokens (GitHub Actions, Railway, Vercel, etc.)
# Usage: ./runner-preflight-check-generic.sh <SYSTEM> <OWNER> <REPO> <TOKEN>
# SYSTEM: github | railway | vercel | ...

set -e

SYSTEM="$1"
OWNER="$2"
REPO="$3"
TOKEN="$4"

if [[ -z "$SYSTEM" || -z "$OWNER" || -z "$REPO" || -z "$TOKEN" ]]; then
  echo "Usage: $0 <SYSTEM> <OWNER> <REPO> <TOKEN>"
  exit 1
fi

case "$SYSTEM" in
  github)
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $TOKEN" \
      "https://api.github.com/repos/$OWNER/$REPO/actions/runners/registration-token")
    if [[ "$RESPONSE" == "201" ]]; then
      echo "[PASS] GitHub runner token is valid."
      exit 0
    else
      echo "[FAIL] GitHub runner token is INVALID or expired (HTTP $RESPONSE)."
      exit 2
    fi
    ;;
  railway)
    # Validate Railway token by calling the Railway API (whoami endpoint)
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" \
      "https://backboard.railway.app/graphql" \
      --data '{"query":"{ viewer { id name } }"}' \
      -H "Content-Type: application/json")
    if [[ "$RESPONSE" == "200" ]]; then
      echo "[PASS] Railway token is valid."
      exit 0
    else
      echo "[FAIL] Railway token is INVALID or expired (HTTP $RESPONSE)."
      exit 2
    fi
    ;;
  vercel)
    # Placeholder: Add Vercel token validation logic here
    echo "[WARN] Vercel token validation not implemented. Skipping."
    exit 0
    ;;
  *)
    echo "[WARN] Unknown system '$SYSTEM'. No validation performed."
    exit 0
    ;;
esac
