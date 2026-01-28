#!/bin/bash
# Schedule daily Anthropic compliance report generation
# Add this to crontab: 0 2 * * * /workspaces/bickford/outputs/anthropic_auto_compliance_report_scheduler.sh

cd /workspaces/bickford
bun run outputs/optr/optr_ledger_analysis.ts > outputs/anthropic_auto_compliance_report.md

echo "# Anthropic Automated Compliance Report" > outputs/anthropic_auto_compliance_report.md
cat outputs/anthropic_auto_compliance_report.md
