
#!/usr/bin/env bash
set -euo pipefail

echo "🔒 Final core symbol authority batch starting…"

CORE=packages/core/src

#############################################
# 1️⃣ REMOVE INVALID CANON IMPORTS
#############################################

echo "🧹 Removing invalid canon imports"

INVALID_SYMBOLS=(
  Action
  CandidatePath
  PathScore
  DecisionContext
)

for sym in "${INVALID_SYMBOLS[@]}"; do
  rg "import .*\\b${sym}\\b.*@bickford/canon" "$CORE" -l | while read -r file; do
    sed -i.bak "/${sym}.*@bickford\/canon/d" "$file"
  done
done

#############################################
# 2️⃣ DEFINE CORE-LOCAL AUTHORITY TYPES
#############################################

echo "🧱 Defining core-local authority types"

mkdir -p "$CORE/types"

cat > "$CORE/types/optr.ts" <<'EOF'
export interface CandidatePath {
  id: string;
  score: number;
}
EOF

cat > "$CORE/types/action.ts" <<'EOF'
export interface Action {
  type: string;
  payload?: unknown;
}
EOF

#############################################
# 3️⃣ NORMALIZE CORE TYPE INDEX
#############################################

cat > "$CORE/types/index.ts" <<'EOF'
export * from "./optr";
export * from "./action";

export interface CoreExecutionResult {
  success: boolean;
  message?: string;
}
EOF

#############################################
# 4️⃣ FIX CORE BARREL
#############################################

cat > "$CORE/index.ts" <<'EOF'
export * from "./types";
EOF

#############################################
# 5️⃣ ENSURE NODE BUILT-IN TYPES
#############################################

echo "🧩 Ensuring Node built-in types"

if ! jq -e '.devDependencies["@types/node"]' packages/core/package.json >/dev/null 2>&1; then
  pnpm --filter @bickford/core add -D @types/node
fi

#############################################
# 6️⃣ VERIFY
#############################################

echo "🧪 Verifying core build"
pnpm --filter @bickford/core run build

#############################################
# 7️⃣ COMMIT
#############################################

git add packages/core
git commit -m "core: finalize symbol authority and eliminate phantom canon imports"

echo "✅ Final core symbol batch complete."
