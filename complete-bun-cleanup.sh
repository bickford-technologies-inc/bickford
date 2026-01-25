#!/bin/bash
set -e
rm -rf .next app/.next packages/web-app/.next node_modules/.cache
pnpm store prune
cat > packages/ledger/src/index.ts << 'EOF'
export * from "./prismaLedger.js";
export * from "./prismaConversationMemory.js";
export * from "./superconductor-ledger.js";
export type { Decision } from "./types.js";
EOF
pnpm run build
echo "✅ BUN FIX COMPLETE"
