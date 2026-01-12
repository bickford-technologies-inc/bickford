#!/usr/bin/env bash
set -euo pipefail

echo "🏥 Health Check"
echo "==============="
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
