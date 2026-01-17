#!/usr/bin/env bash
set -euo pipefail

if compgen -G "ci/promotions/pending/*" > /dev/null; then
  echo "❌ Pending invariant promotions detected:"
  ls ci/promotions/pending
  echo "Promote or remove before continuing."
  exit 1
fi
