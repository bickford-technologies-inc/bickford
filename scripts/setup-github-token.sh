#!/bin/bash
# scripts/setup-github-token.sh
# Interactive script to set up, validate, and store a GitHub token

set -e

echo "=== GitHub Token Setup ==="
echo "Paste your new GitHub Personal Access Token (PAT) below:"
read -s TOKEN

if [[ -z "$TOKEN" ]]; then
  echo "❌ No token entered. Exiting."
  exit 1
fi

echo "🔎 Validating token..."
resp=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user)
if echo "$resp" | grep -q '"login"'; then
  echo "✅ Token is valid."
else
  echo "❌ Token is invalid or lacks permissions."
  echo "$resp"
  exit 2
fi

# Store in .github-token
printf "%s\n" "$TOKEN" > .github-token
chmod 600 .github-token

echo "✅ Token saved to .github-token (permissions set to 600)"

# Store in .env (replace or add GITHUB_TOKEN line)
if grep -q '^GITHUB_TOKEN=' .env 2>/dev/null; then
  sed -i 's/^GITHUB_TOKEN=.*/GITHUB_TOKEN='"$TOKEN"'/' .env
else
  echo "GITHUB_TOKEN=$TOKEN" >> .env
fi

echo "✅ Token saved to .env as GITHUB_TOKEN"

echo "All done! Your GitHub token is now set up and validated."
