#!/usr/bin/env bash
set -euo pipefail

echo "🔒 Core TypeScript batch fix starting…"

CORE=packages/core/src

#############################################
# 1️⃣ DEFINE CORE-LOCAL TYPES (NO CANON LEAK)
#############################################

mkdir -p $CORE/types

cat > $CORE/types/index.ts <<'EOF'
export interface CoreExecutionResult {
  success: boolean;
  message?: string;
}
EOF


#############################################
# 3️⃣ REMOVE PHANTOM EXPORTS
#############################################

echo "🧹 Removing invalid core exports"

rg "export .*ExecutionResult" $CORE -l | while read -r file; do
  sed -i.bak '/ExecutionResult/d' "$file"
done

#############################################
# 4️⃣ FIX CORE BARREL
#############################################

cat > $CORE/index.ts <<'EOF'
export * from "./types";
EOF

#############################################
# 5️⃣ VERIFY
#############################################

echo "🧪 Verifying core build"
pnpm --filter @bickford/core run build

#############################################
# 6️⃣ COMMIT
#############################################

git add packages/core
git commit -m "core(types): align core with explicit canon authorities"

echo "✅ Core TS batch fix complete."
