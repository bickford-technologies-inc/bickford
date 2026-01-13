#!/usr/bin/env bash

echo "🏥 Starting Health Monitor (checks every 30s)"
echo ""

while true; do
  sleep 30
  
  # Check backend
  if ! curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "[$(date)] ⚠️  Backend unhealthy, triggering auto-recovery..."
    bash scripts/auto-recover.sh
  fi
  
  # Check frontend
  if ! curl -sf http://localhost:5173 > /dev/null 2>&1; then
    echo "[$(date)] ⚠️  Frontend unhealthy, triggering auto-recovery..."
    bash scripts/auto-recover.sh
  fi
done
