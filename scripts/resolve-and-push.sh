#!/bin/sh
# Resolve, verify, commit, and push changes safely
# Usage: ./scripts/resolve-and-push.sh [branch]
# Default: current branch

set -e

BRANCH="${1:-$(git branch --show-current)}"

if [ -z "$BRANCH" ]; then
  echo "❌ Could not determine current branch"
  exit 1
fi

# Ensure clean working tree before starting
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Working tree is not clean."
  echo "Commit or stash changes before running this script."
  exit 1
fi

echo "🔁 Checking out branch: $BRANCH"
git checkout "$BRANCH"

echo "⬇️  Fetching and rebasing on origin/main"
git fetch origin
git rebase origin/main || {
  echo "⚠️ Rebase stopped due to conflicts."
  echo "Resolve conflicts, then re-run this script."
  exit 1
}

echo "📦 Staging all changes"
git add -A

if git diff --cached --quiet; then
  echo "ℹ️ No changes to commit."
  exit 0
fi

echo "🧪 Running build (blocking)"
npm run build

echo "📝 Committing with canonical intent message"
git commit -m "intent(canon): resolve conflicts and enforce mechanical invariants"

echo "🚀 Pushing branch: $BRANCH"
git push origin "$BRANCH"

echo "✅ Done. Branch is verified, committed, and pushed."
