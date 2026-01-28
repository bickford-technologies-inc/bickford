#!/usr/bin/env bash
# Data Room Setup Script for Gap Closure Automation
# Creates due diligence-ready folder structure and checklist

set -e
BASE_DIR="$(dirname "$0")/.."
DATA_ROOM_DIR="$BASE_DIR/data-room"

mkdir -p "$DATA_ROOM_DIR/01-Corporate"
mkdir -p "$DATA_ROOM_DIR/02-Financial"
mkdir -p "$DATA_ROOM_DIR/03-Technical"
mkdir -p "$DATA_ROOM_DIR/04-Customers"
mkdir -p "$DATA_ROOM_DIR/05-Legal"
mkdir -p "$DATA_ROOM_DIR/06-Team"
mkdir -p "$DATA_ROOM_DIR/07-Strategic"
mkdir -p "$DATA_ROOM_DIR/08-Compliance"

cat > "$DATA_ROOM_DIR/README.md" << EOF
# Data Room Structure

This data room is organized for due diligence and acquisition readiness.

## Folders
- 01-Corporate: Incorporation, cap table, IP assignment
- 02-Financial: Models, ROI validation, pricing
- 03-Technical: Architecture, security audit, scale testing
- 04-Customers: LOIs, pilot reports, testimonials
- 05-Legal: Patents, trademark, licenses
- 06-Team: Bios, org chart, advisors
- 07-Strategic: Pitch deck, competitive analysis, integration
- 08-Compliance: SOC-2, ISO, FedRAMP, HIPAA, GDPR

## Checklist
- [ ] All folders populated with required documents
- [ ] Index files present in each folder
- [ ] All sensitive data redacted as needed
- [ ] Access controls in place

EOF

echo "Data room structure created at $DATA_ROOM_DIR"
