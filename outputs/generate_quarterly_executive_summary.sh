#!/bin/bash
# Auto-generate quarterly executive summary for compliance and value delivery
# Usage: ./generate_quarterly_executive_summary.sh

set -euo pipefail

REPORTS_DIR="/workspaces/bickford/reports"
FEEDBACK_DIR="/workspaces/bickford/feedback"
SUMMARY_DIR="/workspaces/bickford/executive_summaries"
ARCHIVE_LOG="/workspaces/bickford/outputs/compliance_value_report_archive.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
QUARTER=$(date +"Q$((($(date +%m)-1)/3+1))-%Y")
SUMMARY_FILE="$SUMMARY_DIR/executive_summary_${QUARTER}_$TIMESTAMP.md"

mkdir -p "$SUMMARY_DIR"

# Aggregate compliance health and delivery stats
echo "# Executive Summary - $QUARTER" > "$SUMMARY_FILE"
echo "Generated: $TIMESTAMP" >> "$SUMMARY_FILE"
echo -e "\n## Compliance Health & Delivery Stats" >> "$SUMMARY_FILE"
if [[ -f "$ARCHIVE_LOG" ]]; then
  tail -n 20 "$ARCHIVE_LOG" >> "$SUMMARY_FILE"
else
  echo "No compliance archive log found." >> "$SUMMARY_FILE"
fi

echo -e "\n## Value Review Highlights" >> "$SUMMARY_FILE"
if compgen -G "$REPORTS_DIR/*value*" > /dev/null; then
  for f in $REPORTS_DIR/*value*; do
    echo "- $(basename "$f")" >> "$SUMMARY_FILE"
  done
else
  echo "No value review reports found." >> "$SUMMARY_FILE"
fi

echo -e "\n## Customer & Auditor Feedback" >> "$SUMMARY_FILE"
if [[ -d "$FEEDBACK_DIR" ]]; then
  for f in $FEEDBACK_DIR/*; do
    echo "### Feedback: $(basename "$f")" >> "$SUMMARY_FILE"
    cat "$f" >> "$SUMMARY_FILE"
    echo -e "\n---\n" >> "$SUMMARY_FILE"
  done
else
  echo "No feedback found." >> "$SUMMARY_FILE"
fi

echo -e "\n## Continuous Improvement Actions & Recommendations" >> "$SUMMARY_FILE"
# Placeholder for improvement actions (could be parsed from tickets or a TODO file)
echo "- [ ] Review and address all open feedback items." >> "$SUMMARY_FILE"
echo "- [ ] Monitor SLA compliance and escalate as needed." >> "$SUMMARY_FILE"

echo "Quarterly executive summary generated at $SUMMARY_FILE"