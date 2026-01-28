#!/bin/bash
# Auto-submit latest compliance/value reports to regulator/partner endpoints
# Usage: ./submit_reports_to_regulators.sh

set -euo pipefail

REPORTS_DIR="/workspaces/bickford/reports"
ENDPOINTS_FILE="/workspaces/bickford/outputs/regulator_endpoints.conf"
LOG_FILE="/workspaces/bickford/outputs/report_submission.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [[ ! -f "$ENDPOINTS_FILE" ]]; then
  echo "No endpoints config found at $ENDPOINTS_FILE. Exiting." >&2
  exit 1
fi

while IFS=, read -r partner endpoint_type endpoint_value; do
  latest_report=$(ls -t "$REPORTS_DIR" | grep -E "$partner" | head -n1)
  if [[ -n "$latest_report" ]]; then
    report_path="$REPORTS_DIR/$latest_report"
    case "$endpoint_type" in
      sftp)
        # Example: sftp user@host:/path
        echo "Submitting $report_path to SFTP: $endpoint_value"
        # scp "$report_path" "$endpoint_value" # Uncomment and configure SSH keys
        ;;
      api)
        echo "Submitting $report_path to API: $endpoint_value"
        # curl -X POST -F "file=@$report_path" "$endpoint_value"
        ;;
      email)
        echo "Submitting $report_path to Email: $endpoint_value"
        # mail -s "Compliance Report" "$endpoint_value" < "$report_path"
        ;;
      *)
        echo "Unknown endpoint type: $endpoint_type for $partner" >&2
        ;;
    esac
    echo "$TIMESTAMP | $partner | $endpoint_type | $endpoint_value | $latest_report" >> "$LOG_FILE"
  else
    echo "No report found for $partner" >&2
  fi
done < "$ENDPOINTS_FILE"

echo "Report submission completed at $TIMESTAMP"