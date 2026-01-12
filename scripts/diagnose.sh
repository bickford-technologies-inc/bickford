#!/usr/bin/env bash
set -euo pipefail

echo "🔍 System Diagnostics"
echo "===================="
echo ""

# Check 1: Node.js version
echo "1️⃣ Node.js:"
node --version || echo "  ❌ Node.js not found"
echo ""

# Check 2: Dependencies
echo "2️⃣ Dependencies:"
if [ -d "node_modules" ]; then
  echo "  ✅ Root node_modules exists"
else
  echo "  ❌ Root node_modules missing (run: npm install)"
fi

if [ -d "packages/bickford/node_modules" ]; then
  echo "  ✅ Backend node_modules exists"
else
  echo "  ❌ Backend node_modules missing"
fi

if [ -d "packages/web-ui/node_modules" ]; then
  echo "  ✅ Frontend node_modules exists"
else
  echo "  ❌ Frontend node_modules missing"
fi
echo ""

# Check 3: Environment configuration
echo "3️⃣ Environment:"
if [ -f "packages/bickford/.env" ]; then
  echo "  ✅ .env exists"
  
  if grep -q "^OPENAI_API_KEY=sk-" "packages/bickford/.env" 2>/dev/null; then
    echo "  ✅ OPENAI_API_KEY configured"
  else
    echo "  ⚠️  OPENAI_API_KEY not configured (demo mode)"
  fi
  
  if grep -q "^AUTH_DECISION_MODE=" "packages/bickford/.env" 2>/dev/null; then
    MODE=$(grep "^AUTH_DECISION_MODE=" "packages/bickford/.env" | cut -d'=' -f2)
    echo "  ✅ AUTH_DECISION_MODE: $MODE"
  else
    echo "  ⚠️  AUTH_DECISION_MODE not set (defaulting to permissive)"
  fi
else
  echo "  ❌ .env missing (run: npm run setup)"
fi
echo ""

# Check 4: Services status
echo "4️⃣ Services:"
if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "  ✅ Backend running (http://localhost:3000)"
else
  echo "  ❌ Backend not responding"
fi

if curl -sf http://localhost:5173 > /dev/null 2>&1; then
  echo "  ✅ Frontend running (http://localhost:5173)"
else
  echo "  ❌ Frontend not responding"
fi
echo ""

# Check 5: Recent errors
echo "5️⃣ Recent Errors:"
if [ -f "logs/backend.log" ]; then
  ERRORS=$(grep -i "error" logs/backend.log | tail -n 3 || true)
  if [ -n "$ERRORS" ]; then
    echo "  Backend errors:"
    echo "$ERRORS" | sed 's/^/    /'
  else
    echo "  ✅ No recent backend errors"
  fi
else
  echo "  ℹ️  No backend log file"
fi
echo ""

# Recommendations
echo "💡 Recommendations:"
if ! curl -sf http://localhost:3000/api/health > /dev/null 2>&1 || \
   ! curl -sf http://localhost:5173 > /dev/null 2>&1; then
  echo "  Run: npm run recover"
fi

if [ ! -f "packages/bickford/.env" ]; then
  echo "  Run: npm run setup"
fi

echo ""
echo "✅ Diagnostics complete"
