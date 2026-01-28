#!/bin/bash
# Monitor compliance/value delivery SLAs and auto-alert/escalate on risk or breach
# Usage: ./monitor_sla_and_alert.sh

set -euo pipefail

ARCHIVE_LOG="/workspaces/bickford/outputs/compliance_value_report_archive.log"
ALERT_EMAIL="compliance-alerts@anthropic.com"
SLA_MAX_HOURS=24  # Example: reports must be archived within 24 hours
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [[ ! -f "$ARCHIVE_LOG" ]]; then
  echo "No archive log found. Exiting." >&2
  exit 1
fi

# Check for any report older than SLA_MAX_HOURS not archived
touch /tmp/sla_breach.tmp
awk -v max_hours="$SLA_MAX_HOURS" -v now_epoch="$(date +%s)" -F' | ' '{
  split($1, t, "T");
  split(t[2], z, "Z");
  report_time = t[1] " " z[1];
  report_epoch = mktime(gensub(/[-:]/, " ", "g", report_time));
  age_hours = (now_epoch - report_epoch) / 3600;
  if (age_hours > max_hours) {
    print $0 >> "/tmp/sla_breach.tmp"
  }
}' "$ARCHIVE_LOG"

if [[ -s /tmp/sla_breach.tmp ]]; then
  echo "SLA breach detected! Sending alert."
  cat /tmp/sla_breach.tmp | mail -s "[ALERT] Compliance SLA Breach Detected" "$ALERT_EMAIL"
  cat /tmp/sla_breach.tmp >> /workspaces/bickford/outputs/sla_breach.log
else
  echo "No SLA breaches detected at $TIMESTAMP."
fi

rm -f /tmp/sla_breach.tmp
