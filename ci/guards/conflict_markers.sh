#!/usr/bin/env bash
set -euo pipefail

# This guard simply delegates to the canonical conflict-review guard
exec "$(dirname "$0")/conflict-review.sh"
