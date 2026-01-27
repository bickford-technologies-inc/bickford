#!/bin/bash
# Vercel Deployment Health Check Script
# Usage: bash vercel-health-check.sh <your-vercel-domain>

if [ -z "$1" ]; then
  echo "Usage: bash vercel-health-check.sh <your-vercel-domain>"
  echo "Example: bash vercel-health-check.sh my-app.vercel.app"
  exit 1
fi

DOMAIN="$1"

function check_endpoint() {
  local path="$1"
  local url="https://$DOMAIN$path"
  local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo -n "Checking $url ... "
  if [ "$status" = "200" ]; then
    echo "✅ 200 OK"
  else
    echo "❌ $status"
  fi
}

echo "--- Vercel Health Check for $DOMAIN ---"
check_endpoint "/"
check_endpoint "/api/health"
check_endpoint "/api/compliance"

# Show recent headers for root
curl -I "https://$DOMAIN/" | head -10
