#!/bin/bash
# ci/check-ts7016.sh
# Fails CI if any TS7016 (missing type declaration) errors are found in build logs.

set -e

LOGFILE=${1:-build.log}

if grep -q 'TS7016' "$LOGFILE"; then
  echo "\n❌ CI BLOCKED: TypeScript error TS7016 (missing type declaration) detected.\n"
  echo "Please add the appropriate @types/* devDependency to the affected package."
  echo "See https://github.com/DefinitelyTyped/DefinitelyTyped for available types."
  grep 'TS7016' "$LOGFILE"
  exit 1
else
  echo "✅ No TS7016 errors detected. Type safety enforced."
fi
