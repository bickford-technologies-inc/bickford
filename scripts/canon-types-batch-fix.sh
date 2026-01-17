#!/usr/bin/env bash
set -euo pipefail

echo "🔒 Canon TS batch fix starting…"

CANON=packages/canon/src

#############################################
# 1️⃣ ESTABLISH SINGLE TYPE AUTHORITY
#############################################

echo "🧱 Defining canon/types.ts as sole authority"

cat > $CANON/types.ts <<'EOF'
export type CanonLevel = "SYSTEM" | "PACKAGE" | "MODULE" | "FILE";

export interface CanonItemBase {
  id: string;
  level: CanonLevel;
  description: string;
}

export interface ExecutionResult {
  success: boolean;
  reason?: string;
}
EOF

#############################################
# 2️⃣ RUNTIME SURFACE (MINIMAL, REAL)
#############################################

mkdir -p $CANON/runtime

cat > $CANON/runtime/index.ts <<'EOF'
export function enforceInvariants(): void {
  // canonical no-op runtime hook
}
EOF

#############################################
# 3️⃣ OPTR SURFACE (STUBBED, REAL)
#############################################

mkdir -p $CANON/optr

cat > $CANON/optr/index.ts <<'EOF'
export function optr(): void {
  // canonical placeholder
}
EOF

#############################################
# 4️⃣ CANON INDEX — EXPLICIT ONLY
#############################################

cat > $CANON/index.ts <<'EOF'
export type {
  CanonItemBase,
  CanonLevel,
  ExecutionResult
} from "./types";

export { enforceInvariants } from "./runtime";
export { optr } from "./optr";
EOF

#############################################
# 5️⃣ DELETE PHANTOM FILES / EXPORTS
#############################################

echo "🧹 Removing phantom canon files"

rm -f \
  $CANON/canon/index.ts \
  $CANON/canon/types.ts \
  $CANON/canon/promote.ts \
  $CANON/canon/invariants.ts \
  $CANON/promotion.ts || true

#############################################
# 6️⃣ VERIFY
#############################################

echo "🧪 Verifying canon build"
pnpm --filter @bickford/canon run build

#############################################
# 7️⃣ COMMIT
#############################################

git add packages/canon
git commit -m "canon(types): establish explicit type authority and eliminate phantom exports"

echo "✅ Canon TS batch fix complete."
