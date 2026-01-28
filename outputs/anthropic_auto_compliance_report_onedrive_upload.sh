#!/bin/bash
# Upload the latest Anthropic compliance report to OneDrive via rclone
# Requires rclone configured with OneDrive remote

REPORT_PATH="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
ONEDRIVE_REMOTE="onedrive:AnthropicComplianceReports"

if [ -f "$REPORT_PATH" ]; then
  if command -v rclone >/dev/null 2>&1; then
    rclone copy "$REPORT_PATH" "$ONEDRIVE_REMOTE"
    echo "Compliance report uploaded to OneDrive folder $ONEDRIVE_REMOTE."
  else
    echo "rclone not found. Please install and configure rclone for OneDrive."
  fi
else
  echo "Compliance report not found: $REPORT_PATH"
fi
