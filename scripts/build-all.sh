#!/usr/bin/env bash
set -euo pipefail

pnpm install

pnpm --filter @bickford/types build
pnpm --filter @bickford/ledger build
pnpm --filter @bickford/execution-convergence build
pnpm --filter @bickford/web-ui build
