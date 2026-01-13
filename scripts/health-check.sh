#!/usr/bin/env bash
set -euo pipefail

echo "🏥 Running health checks..."
echo ""

# Check if backend is configured
if [ -f "packages/bickford/.env" ]; then
  echo "✅ Environment file exists"
  
  if grep -q "^OPENAI_API_KEY=sk-" "packages/bickford/.env" 2>/dev/null; then
    echo "✅ OPENAI_API_KEY configured"
  else
    echo "⚠️  OPENAI_API_KEY not configured (demo mode)"
  fi
else
  echo "⚠️  No .env file found"
fi

# Check if dependencies are installed
if [ -d "node_modules" ]; then
  echo "✅ Dependencies installed"
else
  echo "❌ Dependencies not installed (run: npm install)"
  exit 1
fi

# Check if services are running (if applicable)
if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Backend API is healthy"
else
  echo "⚠️  Backend API not responding (may not be running)"
fi

if curl -sf http://localhost:5173 > /dev/null 2>&1; then
  echo "✅ Frontend is healthy"
else
  echo "⚠️  Frontend not responding (may not be running)"
fi

echo ""
echo "✅ Health check complete!"
echo "🏥 Health Check"
echo ""

backend_healthy=false
frontend_healthy=false

# Check backend
if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Backend is healthy (http://localhost:3000)"
  backend_healthy=true
else
  echo "❌ Backend is not responding"
fi

# Check frontend
if curl -sf http://localhost:5173 > /dev/null 2>&1; then
  echo "✅ Frontend is healthy (http://localhost:5173)"
  frontend_healthy=true
else
  echo "❌ Frontend is not responding"
fi

echo ""

if $backend_healthy && $frontend_healthy; then
  echo "✅ All systems healthy!"
  exit 0
else
  echo "⚠️  Some systems are unhealthy"
  echo "   Run: npm run recover"
  exit 1
fi
