#!/usr/bin/env bash
set -e

echo "🚀 Bickford Startup Automation"
echo "=============================="
echo ""

# Auto-setup environment if needed
if [ ! -f "packages/bickford/.env" ]; then
  echo "📝 No .env found, running setup..."
  if [ -f "scripts/setup-env.sh" ]; then
    bash scripts/setup-env.sh
  else
    # Inline minimal setup for quick start (no external dependencies required)
    # For full production setup with JWT/Redis/PostgreSQL, use: bash scripts/setup-env.sh
    mkdir -p packages/bickford
    cat > packages/bickford/.env << 'ENVEOF'
AUTH_MODE=none
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_TIMEOUT_MS=15000
ENVEOF
    echo "✅ Created packages/bickford/.env"
  fi
fi

# Check if OPENAI_API_KEY is empty or missing in .env
if ! grep -q "^OPENAI_API_KEY=.\+" packages/bickford/.env 2>/dev/null; then
  # Try to pull from environment
  if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ Auto-configuring OPENAI_API_KEY from environment"
    sed -i.bak "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_API_KEY|" packages/bickford/.env
    rm -f packages/bickford/.env.bak
  else
    echo "⚠️  OPENAI_API_KEY not configured (demo mode enabled)"
    echo "   Set it with: export OPENAI_API_KEY=your_api_key"
  fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo ""
echo "🎯 Starting services..."
echo ""

# Start services (concurrently is installed as devDependency)
npm run dev
