#!/usr/bin/env bash
set -euo pipefail

# Trap errors for better debugging
trap 'echo "❌ Error on line $LINENO"; exit 1' ERR

echo "🚀 Bickford Startup Automation"
echo ""

ENV_FILE="packages/bickford/.env"

# Auto-setup environment if needed
if [ ! -f "$ENV_FILE" ]; then
trap 'echo "❌ Error on line $LINENO"; bash scripts/auto-recover.sh 2>/dev/null || true; exit 1' ERR

echo "🚀 Bickford Startup with Auto-Recovery"
echo ""

# Run initial recovery check
if [ -f "scripts/auto-recover.sh" ]; then
  bash scripts/auto-recover.sh
fi

# Auto-setup environment if needed
if [ ! -f "packages/bickford/.env" ]; then
  echo "📝 No .env found, running setup..."
  if [ -f "scripts/setup-env.sh" ]; then
    bash scripts/setup-env.sh
  else
    # Inline minimal setup
    mkdir -p packages/bickford
    cat > "$ENV_FILE" << 'ENVEOF'
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
    echo "✅ Created $ENV_FILE"
  fi
fi

# Cross-platform sed function
update_env_var() {
  local key=$1
  local value=$2
  local file=$3
  
  # Escape special characters in value
  local escaped_value=$(printf '%s\n' "$value" | sed 's/[&/\]/\\&/g')
  
  # Use perl for cross-platform compatibility
  if command -v perl &> /dev/null; then
    perl -i -pe "s|^${key}=.*|${key}=${escaped_value}|" "$file"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^${key}=.*|${key}=${escaped_value}|" "$file"
  else
    sed -i "s|^${key}=.*|${key}=${escaped_value}|" "$file"
  fi
}

# Check if OPENAI_API_KEY is set in .env
if grep -q "^OPENAI_API_KEY=$" "$ENV_FILE" 2>/dev/null || \
   ! grep -q "^OPENAI_API_KEY=" "$ENV_FILE" 2>/dev/null; then
  
  # Try to pull from environment
  if [ -n "${OPENAI_API_KEY:-}" ]; then
    echo "✅ Auto-configuring OPENAI_API_KEY from environment"
    update_env_var "OPENAI_API_KEY" "$OPENAI_API_KEY" "$ENV_FILE"
  else
    echo "⚠️  OPENAI_API_KEY not configured (demo mode enabled)"
    echo "   Set it with: export OPENAI_API_KEY=sk-..."
    echo "✅ Created packages/bickford/.env"
  fi
fi

# Check if OPENAI_API_KEY is empty or missing in .env
if ! grep -q "^OPENAI_API_KEY=.\+" packages/bickford/.env 2>/dev/null; then
  # Try to pull from environment
  if [ -n "${OPENAI_API_KEY:-}" ]; then
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

# Start health monitor in background
mkdir -p logs
if [ -f "scripts/health-monitor.sh" ]; then
  bash scripts/health-monitor.sh > logs/health-monitor.log 2>&1 &
  MONITOR_PID=$!
  echo "✅ Health monitor started (PID: $MONITOR_PID)"
  echo ""
  
  # Cleanup on exit
  trap "kill $MONITOR_PID 2>/dev/null || true" EXIT
fi

# Pre-flight runner token validation (multi-system, optional)
if [[ -n "$RUNNER_TOKEN" && -n "$RUNNER_REPO" && -n "$RUNNER_OWNER" && -n "$RUNNER_SYSTEM" ]]; then
    echo "[INFO] Running pre-flight runner token validation (multi-system)..."
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if "$SCRIPT_DIR/../runner-preflight-check-generic.sh" "$RUNNER_SYSTEM" "$RUNNER_OWNER" "$RUNNER_REPO" "$RUNNER_TOKEN"; then
        echo "[INFO] Runner token validated for $RUNNER_SYSTEM. Proceeding."
    else
        echo "[ERROR] Runner token invalid or expired for $RUNNER_SYSTEM. Aborting."
        exit 2
    fi
fi

echo ""
echo "🎯 Starting services..."
echo ""

# Start services with concurrently
if command -v npx &> /dev/null; then
  npx concurrently \
    --names "API,WEB" \
    --prefix-colors "cyan,magenta" \
    --kill-others \
    "npm run dev:api" \
    "npm run dev:web"
else
  echo "⚠️  Install concurrently for automatic parallel startup:"
  echo "   npm install -g concurrently"
  echo ""
  echo "Manual startup:"
  echo "  Terminal 1: npm run dev:api"
  echo "  Terminal 2: npm run dev:web"
fi
# Start services (concurrently is installed as devDependency)
npm run dev
