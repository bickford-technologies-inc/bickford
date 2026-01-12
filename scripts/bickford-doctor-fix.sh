#!/usr/bin/env sh
set -e

echo "🛠 Bickford Doctor — auto-fix mode"

# 1) vercel.json cleanup
if [ -f vercel.json ]; then
  if grep -q '"functions"' vercel.json || grep -q '"outputDirectory"' vercel.json; then
    echo "• Cleaning vercel.json (removing illegal keys)"
    node - <<'NODE'
const fs = require('fs');
const p = 'vercel.json';
const j = JSON.parse(fs.readFileSync(p,'utf8'));
delete j.functions;
delete j.outputDirectory;
fs.writeFileSync(p, JSON.stringify(j, null, 2));
NODE
  fi
fi

# 2) Pin Node 20.x
if ! grep -q '"node": "20.x"' package.json; then
  echo "• Pinning Node to 20.x"
  node - <<'NODE'
const fs=require('fs');
const p='package.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.engines = j.engines || {};
j.engines.node = "20.x";
fs.writeFileSync(p, JSON.stringify(j,null,2));
NODE
fi

# 3) Ensure turbo globalEnv
if [ -f turbo.json ]; then
  echo "• Ensuring turbo.json globalEnv"
  node - <<'NODE'
const fs=require('fs');
const p='turbo.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.globalEnv = Array.from(new Set([...(j.globalEnv||[]),
  "DATABASE_URL","OPENAI_API_KEY","ANTHROPIC_API_KEY"
]));
fs.writeFileSync(p, JSON.stringify(j,null,2));
NODE
fi

# 4) Untrack build artifacts if tracked
ARTS=$(git ls-files | grep -E '/dist/|\.next/' || true)
if [ -n "$ARTS" ]; then
  echo "• Removing tracked build artifacts"
  git rm -r --cached $(echo "$ARTS" | tr '\n' ' ') || true
fi

# 5) Prisma schema authority (warn only)
COUNT=$(git ls-files | grep -c 'schema.prisma')
if [ "$COUNT" -ne 1 ]; then
  echo "⚠️ Prisma schemas found: $COUNT (manual resolution required)"
  git ls-files | grep schema.prisma
fi

echo "✅ Auto-fix completed. Run: npm run doctor"
