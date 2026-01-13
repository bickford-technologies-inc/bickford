#!/bin/sh
# Usage: ./resolve-and-push.sh <your-branch>

set -e

BRANCH="${1:-copilot/lovely-pig}"

# Ensure you are on your branch
git checkout "$BRANCH"

# Stage all changes (resolved conflicts)
git add .

# Commit with auto-message
git commit -m "Resolve merge conflicts and update"

# Push branch
git push origin "$BRANCH"

echo "Pushed changes for branch $BRANCH"
echo "You may now merge the PR on GitHub."
