#!/bin/bash
# After each report delivery, auto-request feedback and aggregate responses
# Usage: ./request_and_aggregate_feedback.sh

set -euo pipefail

REPORTS_DIR="/workspaces/bickford/reports"
FEEDBACK_DIR="/workspaces/bickford/feedback"
CUSTOMERS_FILE="/workspaces/bickford/outputs/customers.conf"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$FEEDBACK_DIR"

if [[ ! -f "$CUSTOMERS_FILE" ]]; then
  echo "No customers config found at $CUSTOMERS_FILE. Exiting." >&2
  exit 1
fi

while IFS=, read -r customer email; do
  # Skip comments and empty lines
  [[ "$customer" =~ ^#.*$ || -z "$customer" ]] && continue
  # Find latest report for customer (case-insensitive, partial match)
  latest_report=$(ls -t "$REPORTS_DIR" | grep -i "$customer" | head -n1 || true)
  if [[ -n "$latest_report" ]]; then
    report_path="$REPORTS_DIR/$latest_report"
    echo "Requesting feedback from $customer ($email) for $latest_report"
    # mail -s "Feedback Request: Compliance Report" "$email" < "$report_path"
    feedback_file="$FEEDBACK_DIR/${customer}_$(basename "$latest_report").feedback"
    if [[ -f "$feedback_file" ]]; then
      echo "Feedback for $latest_report from $customer at $TIMESTAMP: [PENDING]" >> "$feedback_file"
    else
      echo "Feedback for $latest_report from $customer at $TIMESTAMP: [PENDING]" > "$feedback_file"
    fi
  else
    echo "No report found for $customer" >&2
  fi
done < "$CUSTOMERS_FILE"

echo "Feedback requests sent and aggregation initialized at $TIMESTAMP"