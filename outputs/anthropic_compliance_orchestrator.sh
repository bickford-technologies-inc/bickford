#!/bin/bash
# Centralized orchestrator for Anthropic compliance report distribution
CONFIG="/workspaces/bickford/outputs/anthropic_compliance_orchestrator_config.json"
REPORT="/workspaces/bickford/outputs/anthropic_auto_compliance_report.md"
LOG="/workspaces/bickford/outputs/anthropic_compliance_orchestrator.log"

function log_status {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG"
}

CHANNELS=$(jq -r '.channels[] | select(.enabled) | .name' "$CONFIG")

for channel in $CHANNELS; do
  case $channel in
    email)
      ./outputs/anthropic_auto_compliance_report_email.sh && log_status "Email: Success" || log_status "Email: Failure" ;;
    slack)
      bun run outputs/anthropic_auto_compliance_report_slack.js && log_status "Slack: Success" || log_status "Slack: Failure" ;;
    teams)
      ./outputs/anthropic_auto_compliance_report_teams_upload.sh && log_status "Teams: Success" || log_status "Teams: Failure" ;;
    dashboard)
      ./outputs/anthropic_auto_compliance_report_dashboard_upload.sh && log_status "Dashboard: Success" || log_status "Dashboard: Failure" ;;
    s3)
      ./outputs/anthropic_auto_compliance_report_dashboard_upload.sh && log_status "S3: Success" || log_status "S3: Failure" ;;
    gdrive)
      ./outputs/anthropic_auto_compliance_report_gdrive_upload.sh && log_status "GDrive: Success" || log_status "GDrive: Failure" ;;
    box)
      ./outputs/anthropic_auto_compliance_report_box_upload.sh && log_status "Box: Success" || log_status "Box: Failure" ;;
    onedrive)
      ./outputs/anthropic_auto_compliance_report_onedrive_upload.sh && log_status "OneDrive: Success" || log_status "OneDrive: Failure" ;;
    dropbox)
      ./outputs/anthropic_auto_compliance_report_dropbox_upload.sh && log_status "Dropbox: Success" || log_status "Dropbox: Failure" ;;
    sftp)
      ./outputs/anthropic_auto_compliance_report_portal_upload.sh && log_status "SFTP: Success" || log_status "SFTP: Failure" ;;
    webhook)
      ./outputs/anthropic_auto_compliance_report_webhook_notify.sh && log_status "Webhook: Success" || log_status "Webhook: Failure" ;;
    *)
      log_status "Unknown channel: $channel" ;;
  esac
done
