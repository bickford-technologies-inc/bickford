#!/bin/bash
# Health check for Anthropic compliance orchestrator
LOG="/workspaces/bickford/outputs/anthropic_compliance_orchestrator.log"
ALERT_EMAIL="anthropic-leadership@example.com"
ALERT_SLACK_WEBHOOK=${SLACK_WEBHOOK_URL:-""}
ALERT_TEAMS_WEBHOOK=${TEAMS_WEBHOOK_URL:-""}
ALERT_WEBHOOK=${WEBHOOK_URL:-""}

LAST_RUN=$(tail -20 "$LOG")
FAILURES=$(echo "$LAST_RUN" | grep -i 'Failure')

if [ -n "$FAILURES" ]; then
  MSG="[ALERT] Anthropic Compliance Orchestrator Failures Detected:\n$FAILURES"
  # Email alert
  if command -v mail >/dev/null 2>&1; then
    echo -e "$MSG" | mail -s "[ALERT] Compliance Orchestrator Failure" $ALERT_EMAIL
  fi
  # Slack alert
  if [ -n "$ALERT_SLACK_WEBHOOK" ]; then
    curl -H 'Content-Type: application/json' -d "{\"text\":\"$MSG\"}" "$ALERT_SLACK_WEBHOOK"
  fi
  # Teams alert
  if [ -n "$ALERT_TEAMS_WEBHOOK" ]; then
    curl -H 'Content-Type: application/json' -d "{\"text\":\"$MSG\"}" "$ALERT_TEAMS_WEBHOOK"
  fi
  # Generic webhook
  if [ -n "$ALERT_WEBHOOK" ]; then
    curl -H 'Content-Type: application/json' -d "{\"text\":\"$MSG\"}" "$ALERT_WEBHOOK"
  fi
  echo "[ALERT] Compliance orchestrator failures detected and alerts sent."
else
  echo "[OK] Compliance orchestrator healthy."
fi
