#!/bin/bash
# Upload the latest Anthropic compliance report to Dropbox via Dropbox CLI
# Requires Dropbox CLI and authentication

REPORT_PATH="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
DROPBOX_PATH="/AnthropicComplianceReports/anthropic_auto_compliance_report.md"

if [ -f "$REPORT_PATH" ]; then
  if command -v dropbox >/dev/null 2>&1; then
    dropbox upload "$REPORT_PATH" "$DROPBOX_PATH"
    echo "Compliance report uploaded to Dropbox at $DROPBOX_PATH."
  else
    echo "Dropbox CLI not found. Please install and authenticate Dropbox CLI."
  fi
else
  echo "Compliance report not found: $REPORT_PATH"
fi
