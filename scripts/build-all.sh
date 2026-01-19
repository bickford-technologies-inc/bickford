#!/usr/bin/env bash
set -euo pipefail

pnpm install

pnpm --filter @bickford/types build
pnpm -r --filter @bickford/* build
