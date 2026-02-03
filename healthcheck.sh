#!/bin/bash
# Automated health check for Bickford deployment

URL="http://localhost:3000/api/health"
RETRIES=5
SLEEP=5

for i in $(seq 1 $RETRIES); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  if [ "$STATUS" == "200" ]; then
    echo "[OK] Health check passed at $(date)"
    exit 0
  else
    echo "[WARN] Health check failed (status $STATUS) at $(date)"
    sleep $SLEEP
  fi
done

echo "[ERROR] Service is DOWN after $RETRIES attempts at $(date)" >&2
exit 1
