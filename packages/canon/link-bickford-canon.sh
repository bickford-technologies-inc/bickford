#!/bin/bash
set -e

# List absolute paths to all dependent repos here:
REPO_PATHS=(
  "/path/to/session-completion-runtime"
  "/path/to/hvpe-cloud-portal"
  "/path/to/bickford-mobile"
  # Add more as needed
)

CANON_PKG_NAME="@bickford/canon"

if [[ "$1" == "unlink" ]]; then
  echo "Unlinking $CANON_PKG_NAME from all repos..."
  npm unlink
  for repo in "${REPO_PATHS[@]}"; do
    (cd "$repo" && npm unlink $CANON_PKG_NAME || true)
  done
  echo "Unlink complete."
  exit 0
fi

# List absolute paths to all dependent repos here:
REPO_PATHS=(
  "/path/to/session-completion-runtime"
  "/path/to/hvpe-cloud-portal"
  "/path/to/bickford-mobile"
  # Add more as needed
)

CANON_PKG_NAME="@bickford/canon"

if [[ "$1" == "unlink" ]]; then
  echo "Unlinking $CANON_PKG_NAME from all repos..."
  npm unlink
  for repo in "${REPO_PATHS[@]}"; do
    (cd "$repo" && npm unlink $CANON_PKG_NAME || true)
  done
  echo "Unlink complete."
  exit 0
fi

echo "Linking $CANON_PKG_NAME globally..."
npm link

for repo in "${REPO_PATHS[@]}"; do
  echo "Linking $CANON_PKG_NAME into $repo..."
  (cd "$repo" && npm link $CANON_PKG_NAME)
done

for repo in "${REPO_PATHS[@]}"; do
  echo "Linking $CANON_PKG_NAME into $repo..."
  (cd "$repo" && npm link $CANON_PKG_NAME)
done

echo "All repos now use live Bickford Canon source. Changes are real-time!"
