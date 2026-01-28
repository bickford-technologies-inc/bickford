#!/bin/bash
# Upload the latest Anthropic compliance report to a customer portal via SFTP
# Requires SFTP credentials and server

REPORT_PATH="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
SFTP_USER="customerportal"
SFTP_HOST="sftp.customer-portal.com"
SFTP_PATH="/reports/anthropic/"

if [ -f "$REPORT_PATH" ]; then
  if command -v sftp >/dev/null 2>&1; then
    echo "put $REPORT_PATH $SFTP_PATH" | sftp $SFTP_USER@$SFTP_HOST
    echo "Compliance report uploaded to customer portal via SFTP."
  else
    echo "sftp command not found. Please install SFTP client."
  fi
else
  echo "Compliance report not found: $REPORT_PATH"
fi
