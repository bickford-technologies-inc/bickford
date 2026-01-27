#!/bin/bash
# Test Railway Deployment - Live Endpoint Check
set -e
SERVICE_NAME="@bickford/web-app"
DEPLOY_URL=$(npx @railway/cli domain --service "$SERVICE_NAME" 2>/dev/null | head -1)
if [ -z "$DEPLOY_URL" ]; then
  echo "❌ Could not get deployment URL"; exit 1; fi
echo "✓ Found URL: $DEPLOY_URL"
echo "💚 Testing health check endpoint..."
if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_URL/" | grep -q "200"; then
  echo "✓ Health check passed (200 OK)"; else echo "⚠️  Health check returned non-200 status"; fi
echo "🔌 Testing API endpoints..."
API_RESPONSE=$(curl -s "https://$DEPLOY_URL/api/health" || echo "")
if [ -n "$API_RESPONSE" ]; then echo "✓ API responding: $API_RESPONSE"; else echo "ℹ️  No API health endpoint"; fi
echo "📊 Testing Superconductor compliance endpoint..."
COMPLIANCE_RESPONSE=$(curl -s "https://$DEPLOY_URL/api/compliance" || echo "")
if echo "$COMPLIANCE_RESPONSE" | grep -q "certificate\|compression"; then echo "✓ Superconductor API responding"; else echo "ℹ️  Superconductor not yet integrated"; fi
echo "📜 Recent deployment logs:"; npx @railway/cli logs --service "$SERVICE_NAME" --limit 10
