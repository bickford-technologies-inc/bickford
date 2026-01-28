#!/bin/bash
# Notify external systems of new compliance report via generic webhook
# Requires WEBHOOK_URL environment variable

REPORT_PATH="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
WEBHOOK_URL=${WEBHOOK_URL:-""}

if [ -f "$REPORT_PATH" ]; then
  if [ -n "$WEBHOOK_URL" ]; then
    MSG="Anthropic Automated Compliance Report\n\n$(head -c 3500 "$REPORT_PATH")..."
    curl -H 'Content-Type: application/json' -d "{\"text\":\"$MSG\"}" "$WEBHOOK_URL"
    echo "Compliance report sent to external webhook."
  else
    echo "WEBHOOK_URL not set."
  fi
else
  echo "Compliance report not found: $REPORT_PATH"
fi
