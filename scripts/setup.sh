#!/bin/bash
set -e

echo "🚀 Bickford Setup"

# 1. Check .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from template"
fi

# 2. Start Postgres if DATABASE_URL not set
if [ -z "$DATABASE_URL" ]; then
  docker-compose up -d postgres
  export DATABASE_URL="postgresql://bickford:dev@localhost:5432/bickford"
  echo "✅ Started local Postgres"
fi

# 3. Initialize database
npx prisma migrate deploy
echo "✅ Database ready"

# 4. Install deps if needed
if [ ! -d node_modules ]; then
  npm install
fi

echo "✅ Setup complete. Starting dev server..."
