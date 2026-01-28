#!/bin/bash
# Upload the latest Anthropic compliance report to a dashboard or S3 bucket
# Requires AWS CLI configured or dashboard API endpoint

REPORT_PATH="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
S3_BUCKET="s3://anthropic-compliance-reports/"
DASHBOARD_API="https://dashboard.anthropic.com/api/reports/upload"

# Upload to S3 (if AWS CLI is configured)
if command -v aws >/dev/null 2>&1; then
  aws s3 cp "$REPORT_PATH" "$S3_BUCKET"
  echo "Compliance report uploaded to $S3_BUCKET"
fi

# Upload to dashboard API (if curl is available)
if command -v curl >/dev/null 2>&1; then
  curl -X POST -F "file=@$REPORT_PATH" "$DASHBOARD_API"
  echo "Compliance report uploaded to dashboard API: $DASHBOARD_API"
fi
