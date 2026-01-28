#!/usr/bin/env bash
# Master Control Panel for Gap Closure Automation
# Provides menu-driven orchestration of all automation scripts

set -e
BASE_DIR="$(dirname "$0")/.."
SCRIPTS_DIR="$BASE_DIR/scripts"
REPORTS_DIR="$BASE_DIR/reports"
EVIDENCE_DIR="$BASE_DIR/evidence"
DATA_ROOM_DIR="$BASE_DIR/data-room"
CUSTOMER_DISCOVERY_DIR="$BASE_DIR/customer-discovery"

function run_all_automations() {
  echo "\n🚀 Running all gap closure automations...\n"
  bun run "$SCRIPTS_DIR/gap-tracker.ts"
  bun run "$SCRIPTS_DIR/weekly-report-generator.ts"
  bun run "$SCRIPTS_DIR/customer-discovery-automation.ts"
  bash "$SCRIPTS_DIR/setup-data-room.sh"
  echo "\n✅ All automations executed.\n"
}

function view_status() {
  echo "\n📊 Current Gap Status:\n"
  cat "$REPORTS_DIR/STATUS_REPORT.md" 2>/dev/null || echo "No status report found. Run automations first."
}

function generate_weekly_report() {
  echo "\n📝 Generating weekly report...\n"
  bun run "$SCRIPTS_DIR/weekly-report-generator.ts"
  echo "\n✅ Weekly report generated.\n"
}

function setup_data_room() {
  echo "\n🏢 Setting up data room...\n"
  bash "$SCRIPTS_DIR/setup-data-room.sh"
  echo "\n✅ Data room setup complete.\n"
}

function customer_discovery_tools() {
  echo "\n👥 Running customer discovery automation...\n"
  bun run "$SCRIPTS_DIR/customer-discovery-automation.ts"
  echo "\n✅ Customer discovery automation complete.\n"
}

function show_menu() {
  echo "\n==== Bickford Gap Closure Automation Control Panel ===="
  echo "1. Run All Automations"
  echo "2. View Current Status"
  echo "3. Generate Weekly Report"
  echo "4. Setup Data Room"
  echo "5. Run Customer Discovery Automation"
  echo "6. Exit"
  echo -n "\nSelect an option [1-6]: "
}

while true; do
  show_menu
  read -r choice
  case $choice in
    1) run_all_automations ;;
    2) view_status ;;
    3) generate_weekly_report ;;
    4) setup_data_room ;;
    5) customer_discovery_tools ;;
    6) echo "Exiting."; exit 0 ;;
    *) echo "Invalid option. Please select 1-6." ;;
  esac
done
