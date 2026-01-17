#!/usr/bin/env bash
set -euo pipefail

# 1. Invariant guards
./ci/guards/conflict-review.sh

# 2. Lockfile invariant
./ci/guards/lockfile-invariant.sh
