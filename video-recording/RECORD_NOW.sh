#!/bin/bash
# One-click demo video recording helper

frames=(
  "00-problem-statement.txt"
  "01-side-by-side.txt"
  "02-performance.txt"
  "03-cost-savings.txt"
  "04-market-unlock.txt"
  "05-competitive-moat.txt"
)

cd "$(dirname "$0")/frames"

for frame in "${frames[@]}"; do
  clear
  cat "$frame"
  echo
  echo "---"
  echo "Press Enter for next frame..."
  read
done

clear
echo "🎬 Recording complete! Review your video and upload."
