#!/bin/bash

# Simple deployment check script for Vercel and Railway
# Edit these URLs to match your actual deployments
VERCEL_URL="https://bickford.vercel.app"
RAILWAY_HEALTH_URL="https://your-backend-url/health"

echo "Checking Vercel production URL..."
curl -s -I "$VERCEL_URL" | grep "200 OK" && echo "✅ Vercel is live." || echo "❌ Vercel is not live."

echo "Checking Railway backend health endpoint..."
curl -s -I "$RAILWAY_HEALTH_URL" | grep "200 OK" && echo "✅ Railway backend is live." || echo "❌ Railway backend is not live."
