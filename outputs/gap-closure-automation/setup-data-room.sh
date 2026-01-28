#!/usr/bin/env bash
# Data Room Setup Automation
# Creates organized virtual data room for Anthropic acquisition due diligence
#
set -e

# File paths
DATA_ROOM_DIR="/home/anthropic/data-room"
CONFIG_FILE="${DATA_ROOM_DIR}/config.json"

# Create the data room directory if it doesn't exist
mkdir -p "$DATA_ROOM_DIR"

# Generate a config file with default values
cat > "$CONFIG_FILE" << EOF
{
  "data_room_dir": "/home/anthropic/data-room",
  "config_file": "/home/anthropic/data-room/config.json",
  "user": "anthropic",
  "password": "password",
  "permissions": {
    "read": true,
    "write": true,
    "execute": true
  }
}
EOF

echo "Data room setup complete!"