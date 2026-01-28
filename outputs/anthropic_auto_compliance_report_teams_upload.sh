#!/bin/bash
# Send the latest Anthropic compliance report to Microsoft Teams via webhook
# Requires TEAMS_WEBHOOK_URL environment variable

REPORT_PATH="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
TEAMS_WEBHOOK_URL=${TEAMS_WEBHOOK_URL:-""}

if [ -f "$REPORT_PATH" ]; then
  if [ -n "$TEAMS_WEBHOOK_URL" ]; then
    MSG="Anthropic Automated Compliance Report\n\n$(head -c 3500 "$REPORT_PATH")..."
    curl -H 'Content-Type: application/json' -d "{\"text\":\"$MSG\"}" "$TEAMS_WEBHOOK_URL"
    echo "Compliance report sent to Microsoft Teams."
  else
    echo "TEAMS_WEBHOOK_URL not set."
  fi
else
  echo "Compliance report not found: $REPORT_PATH"
fi
