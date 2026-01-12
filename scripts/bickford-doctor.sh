#!/usr/bin/env sh
set -e

echo "🩺 Bickford Doctor — validating invariants..."

# 1. vercel.json
if [ -f vercel.json ]; then
  grep -q '"functions"' vercel.json && echo "❌ vercel.json has functions" && exit 1
  grep -q '"outputDirectory"' vercel.json && echo "❌ vercel.json has outputDirectory" && exit 1
fi

# 2. Prisma schema
COUNT=$(git ls-files | grep -c 'schema.prisma')
[ "$COUNT" -eq 1 ] || (echo "❌ Prisma schemas != 1" && git ls-files | grep schema.prisma && exit 1)

# 3. React types
npm ls @types/react >/tmp/react-types.json
if [ "$(jq '.dependencies | length' /tmp/react-types.json)" -gt 1 ]; then
  echo "❌ Multiple @types/react detected"
  npm ls @types/react
  exit 1
fi

# 4. Turbo env
for VAR in DATABASE_URL OPENAI_API_KEY ANTHROPIC_API_KEY; do
  grep -q "$VAR" turbo.json || (echo "❌ turbo.json missing $VAR" && exit 1)
done

# 5. Node pin
grep -q '"node": "20.x"' package.json || (echo "❌ Node not pinned to 20.x" && exit 1)

# 6. dist artifacts
git ls-files | grep -E '/dist/|\.next/' && echo "❌ Build artifacts tracked" && exit 1 || true

echo "✅ All invariants satisfied."
