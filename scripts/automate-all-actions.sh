#!/bin/bash
# scripts/automate-all-actions.sh
# Automates Node.js upgrade, GitHub token setup, integration check, build, test, and deploy
set -e

# 1. Source nvm if available
if [ -d "$HOME/.nvm" ]; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
elif [ -d "/usr/local/share/nvm" ]; then
  export NVM_DIR="/usr/local/share/nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
fi

# 2. Enforce Node.js v20.x
NODE_VERSION=$(node -v 2>/dev/null || echo "v0.0.0")
if [[ "$NODE_VERSION" != v20* ]]; then
  echo "Switching to Node.js v20.x..."
  nvm install 20
  nvm use 20
fi
node -v


# 3. Bickford repo token setup
if [ ! -f .bickford-repo-token ]; then
  echo "Paste your new Bickford Repo Personal Access Token (PAT):"
  read -s TOKEN
  echo "$TOKEN" > .bickford-repo-token
fi
export BICKFORD_REPO_TOKEN=$(cat .bickford-repo-token)
if ! grep -q "^BICKFORD_REPO_TOKEN=" .env 2>/dev/null; then
  echo "BICKFORD_REPO_TOKEN=$BICKFORD_REPO_TOKEN" >> .env
else
  sed -i 's/^BICKFORD_REPO_TOKEN=.*/BICKFORD_REPO_TOKEN='"$BICKFORD_REPO_TOKEN"'/' .env
fi

# 4. Validate token
if [[ "$BICKFORD_REPO_TOKEN" == ghp_* || "$BICKFORD_REPO_TOKEN" == github_pat_* ]]; then
  AUTH_HEADER="Authorization: Bearer $BICKFORD_REPO_TOKEN"
else
  AUTH_HEADER="Authorization: token $BICKFORD_REPO_TOKEN"
fi

if curl -s -H "$AUTH_HEADER" https://api.github.com/user | grep -q '"login"'; then
  echo "✅ Bickford repo token is valid."
else
  echo "❌ Bickford repo token is invalid. Please check and try again."
  echo ""
  echo "To fix this, generate a new GitHub Personal Access Token (PAT) with these scopes:"
  echo "  - repo"
  echo "  - read:user"
  echo "For fine-grained tokens, ensure:"
  echo "  - Contents: Read and write"
  echo "  - Metadata: Read-only"
  echo ""
  echo "Generate a new token here: https://github.com/settings/tokens"
  echo "Then paste it into .bickford-repo-token and re-run this script."
  exit 1
fi

# 5. Integration check
bash scripts/check-github-integration.sh

# 6. Build, test, deploy
if [ $? -eq 0 ]; then
  echo "Running bun install..."
  bun install
  echo "Running bun run build..."
  bun run build
  if grep -q '"test"' package.json; then
    echo "Running bun run test..."
    bun run test || echo "Tests failed, check output."
  else
    echo "No test script found in package.json, skipping tests."
  fi
  if [ -f sync-and-deploy.sh ]; then
    echo "Triggering deployment..."
    bash sync-and-deploy.sh
  else
    echo "No deployment script found."
  fi
else
  echo "GitHub integration failed. Aborting workflows."
  exit 2
fi

echo "All actions completed."
