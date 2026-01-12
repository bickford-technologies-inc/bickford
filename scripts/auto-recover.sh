#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Auto-Recovery System"
echo "======================="
echo ""

# Function to check if services are healthy
check_health() {
  local service=$1
  local url=$2
  
  if curl -sf "$url" > /dev/null 2>&1; then
    echo "✅ $service is healthy"
    return 0
  else
    echo "⚠️  $service is not responding"
    return 1
  fi
}

# Function to restart service
restart_service() {
  local service=$1
  echo "🔄 Restarting $service..."
  
  case "$service" in
    backend)
      # Kill process by name pattern, but only if running
      pgrep -f "npm run dev:api" | xargs -r kill 2>/dev/null || true
      sleep 2
      npm run dev:api > logs/backend.log 2>&1 &
      ;;
    frontend)
      # Kill process by name pattern, but only if running
      pgrep -f "npm run dev:web" | xargs -r kill 2>/dev/null || true
      sleep 2
      npm run dev:web > logs/frontend.log 2>&1 &
      ;;
  esac
  
  sleep 5
}

# Function to fix common issues
auto_fix() {
  echo "🔧 Attempting automatic fixes..."
  
  # Fix 1: Reset modified files to last working state
  if git diff --quiet; then
    echo "✅ No local changes to reset"
  else
    echo "⚠️  Local changes detected, creating backup..."
    git stash push -m "auto-recovery-backup-$(date +%s)"
    echo "✅ Changes stashed, files reset to working state"
  fi
  
  # Fix 2: Reinstall dependencies if node_modules is corrupted
  if [ ! -d "node_modules" ] || [ ! -d "packages/bickford/node_modules" ]; then
    echo "📦 Reinstalling dependencies..."
    npm install
  fi
  
  # Fix 3: Clear build cache
  echo "🗑️  Clearing build cache..."
  rm -rf packages/*/dist packages/*/.vite packages/*/.turbo
  
  # Fix 4: Ensure .env exists with defaults
  if [ ! -f "packages/bickford/.env" ]; then
    echo "📝 Creating default .env..."
    bash scripts/setup-env.sh
  fi
  
  # Fix 5: Fix AUTH_DECISION_MODE if causing issues
  if grep -q "^AUTH_DECISION_MODE=" "packages/bickford/.env" 2>/dev/null; then
    echo "✅ AUTH_DECISION_MODE already set"
  else
    echo "AUTH_DECISION_MODE=permissive" >> packages/bickford/.env
    echo "✅ Set AUTH_DECISION_MODE to permissive"
  fi
}

# Main recovery loop
mkdir -p logs

echo "🏥 Checking system health..."
echo ""

backend_healthy=false
frontend_healthy=false

check_health "Backend" "http://localhost:3000/api/health" && backend_healthy=true || true
check_health "Frontend" "http://localhost:5173" && frontend_healthy=true || true

if $backend_healthy && $frontend_healthy; then
  echo ""
  echo "✅ All systems healthy!"
  exit 0
fi

echo ""
echo "🔧 Issues detected, starting auto-recovery..."
echo ""

# Attempt automatic fixes
auto_fix

# Restart unhealthy services
if ! $backend_healthy; then
  restart_service backend
  sleep 3
  check_health "Backend" "http://localhost:3000/api/health" && backend_healthy=true || backend_healthy=false
fi

if ! $frontend_healthy; then
  restart_service frontend
  sleep 3
  check_health "Frontend" "http://localhost:5173" && frontend_healthy=true || frontend_healthy=false
fi

echo ""
echo "📊 Recovery Summary"
echo "==================="
echo "Backend:  $(if $backend_healthy; then echo "✅ Healthy"; else echo "❌ Still unhealthy"; fi)"
echo "Frontend: $(if $frontend_healthy; then echo "✅ Healthy"; else echo "❌ Still unhealthy"; fi)"
echo ""

if $backend_healthy && $frontend_healthy; then
  echo "✅ Auto-recovery successful!"
  echo "   View logs:"
  echo "   - Backend:  tail -f logs/backend.log"
  echo "   - Frontend: tail -f logs/frontend.log"
  exit 0
else
  echo "⚠️  Auto-recovery incomplete"
  echo "   Check logs for details:"
  echo "   - Backend:  cat logs/backend.log"
  echo "   - Frontend: cat logs/frontend.log"
  echo ""
  echo "   Run manually:"
  echo "   - npm run dev:api"
  echo "   - npm run dev:web"
  exit 1
fi
