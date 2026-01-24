#!/bin/bash
# vercel-deployment-status.sh: Check latest Vercel deployment status for a project
# Usage: ./vercel-deployment-status.sh <vercel_project_name>
# Requires: Vercel CLI (npm i -g vercel), VERCEL_TOKEN env var set

PROJECT="$1"
if [ -z "$PROJECT" ]; then
  echo "Usage: $0 <vercel_project_name>"
  exit 1
fi

# Fetch latest deployment
vercel --token "$VERCEL_TOKEN" --scope bickford-technologies-inc ls "$PROJECT" --limit 1
