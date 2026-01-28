#!/bin/bash
# Notify customers of new compliance report via email and Slack
# Requires 'mail' or 'sendmail' and SLACK_WEBHOOK_URL

REPORT_PATH="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
CUSTOMER_EMAILS="customer1@example.com,customer2@example.com"
SUBJECT="[Automated] Your Latest Anthropic Compliance Report $(date +%Y-%m-%d)"
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL:-""}

# Email notification
if [ -f "$REPORT_PATH" ]; then
  if command -v mail >/dev/null 2>&1; then
    cat "$REPORT_PATH" | mail -s "$SUBJECT" $CUSTOMER_EMAILS
    echo "Compliance report emailed to: $CUSTOMER_EMAILS"
  fi
fi

# Slack notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  MSG="*Your Anthropic Automated Compliance Report is ready.*\n\n$(head -c 3500 "$REPORT_PATH")..."
  curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$MSG\"}" "$SLACK_WEBHOOK_URL"
  echo "Compliance report sent to customer Slack channel."
fi
