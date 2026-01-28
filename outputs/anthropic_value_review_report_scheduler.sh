#!/bin/bash
# Schedule monthly Anthropic value review report generation
# Add this to crontab: 0 3 1 * * /workspaces/bickford/outputs/anthropic_value_review_report_scheduler.sh

cd /workspaces/bickford
bun run outputs/optr/optr_ledger_analysis.ts > outputs/anthropic_value_review_report.md

echo "# Anthropic Value Review Report (Automated)" > outputs/anthropic_value_review_report.md
cat outputs/anthropic_value_review_report.md
