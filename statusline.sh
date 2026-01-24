#!/usr/bin/env bash
set -euo pipefail

payload="$(cat)"
model_name=$(jq -r '.model.display_name // "Unknown Model"' <<<"$payload")
current_dir=$(jq -r '.workspace.current_dir // "Unknown Dir"' <<<"$payload")

accent="\033[38;5;33m"
muted="\033[38;5;245m"
reset="\033[0m"

printf "%b🧠 %s%b %b|%b 📁 %s\n" "$accent" "$model_name" "$reset" "$muted" "$reset" "$current_dir"
