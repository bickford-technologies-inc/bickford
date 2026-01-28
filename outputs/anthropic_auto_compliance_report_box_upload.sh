#!/bin/bash
# Upload the latest Anthropic compliance report to Box via box CLI
# Requires box CLI and authentication

REPORT_PATH="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
BOX_FOLDER_ID="your-box-folder-id"

if [ -f "$REPORT_PATH" ]; then
  if command -v box >/dev/null 2>&1; then
    box files:upload "$REPORT_PATH" --parent-id $BOX_FOLDER_ID
    echo "Compliance report uploaded to Box folder $BOX_FOLDER_ID."
  else
    echo "box CLI not found. Please install and authenticate box CLI."
  fi
else
  echo "Compliance report not found: $REPORT_PATH"
fi
