#!/usr/bin/env bash
set -euo pipefail

# 1. Structural coverage
./ci/guards/coverage-check.sh

# 2. Promotion gate
./ci/guards/promotion-gate.sh

# 3. Invariant guards
./ci/guards/conflict-review.sh
