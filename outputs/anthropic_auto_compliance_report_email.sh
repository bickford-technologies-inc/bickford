#!/bin/bash
# Email the latest Anthropic compliance report to leadership and auditors
# Requires 'mail' or 'sendmail' to be configured on the system

REPORT_PATH="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
RECIPIENTS="anthropic-leadership@example.com,compliance-auditor@example.com"
SUBJECT="[Automated] Anthropic Compliance Report $(date +%Y-%m-%d)"

if [ -f "$REPORT_PATH" ]; then
  cat "$REPORT_PATH" | mail -s "$SUBJECT" $RECIPIENTS
  echo "Compliance report emailed to: $RECIPIENTS"
else
  echo "Compliance report not found: $REPORT_PATH"
fi
