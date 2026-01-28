#!/bin/bash
# Archive compliance and value review reports to immutable storage (append-only log)
# Usage: ./anthropic_compliance_report_archive.sh

set -euo pipefail

REPORTS_DIR="/workspaces/bickford/reports"
ARCHIVE_LOG="/workspaces/bickford/outputs/compliance_value_report_archive.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$REPORTS_DIR"
touch "$ARCHIVE_LOG"

for report in "$REPORTS_DIR"/*; do
  if [[ -f "$report" ]]; then
    REPORT_HASH=$(sha256sum "$report" | awk '{print $1}')
    # Only archive if not already present (idempotency)
    if ! grep -q "$REPORT_HASH" "$ARCHIVE_LOG"; then
      echo "$TIMESTAMP | $report | $REPORT_HASH" >> "$ARCHIVE_LOG"
      # Optionally, copy to S3 or WORM storage here
      # aws s3 cp "$report" s3://anthropic-compliance-archive/$(basename "$report") --storage-class GLACIER
    fi
  fi
done

echo "Archived all new reports in $REPORTS_DIR to $ARCHIVE_LOG at $TIMESTAMP"
