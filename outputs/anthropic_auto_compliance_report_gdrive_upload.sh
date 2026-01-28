#!/bin/bash
# Upload the latest Anthropic compliance report to Google Drive via gdrive CLI
# Requires gdrive CLI and authentication

REPORT_PATH="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
GDRIVE_FOLDER_ID="your-google-drive-folder-id"

if [ -f "$REPORT_PATH" ]; then
  if command -v gdrive >/dev/null 2>&1; then
    gdrive upload --parent "$GDRIVE_FOLDER_ID" "$REPORT_PATH"
    echo "Compliance report uploaded to Google Drive folder $GDRIVE_FOLDER_ID."
  else
    echo "gdrive CLI not found. Please install and authenticate gdrive."
  fi
else
  echo "Compliance report not found: $REPORT_PATH"
fi
