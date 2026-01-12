#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT=${1:-staging}

echo "🚀 Deploying to $ENVIRONMENT..."
echo "================================"
echo ""

# Build all packages
echo "📦 Building packages..."
npm run build

# Run health checks
echo "🔍 Running health checks..."
npm run check --if-present

# Deploy based on environment
case "$ENVIRONMENT" in
  staging)
    echo "🎯 Deploying to staging..."
    # Add staging deployment commands
    # Example: vercel deploy --prebuilt
    ;;
  production)
    echo "🎯 Deploying to production..."
    # Add production deployment commands
    # Example: vercel deploy --prod --prebuilt
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo ""
echo "✅ Deployment complete!"
