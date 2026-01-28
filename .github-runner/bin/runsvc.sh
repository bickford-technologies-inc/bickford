#!/bin/bash

# convert SIGTERM signal to SIGINT
trap 'kill -INT $PID' TERM INT

if [ -f ".path" ]; then
    export PATH=`cat .path`
    echo ".path=${PATH}"
fi

# Use system Node.js instead of hardcoded node20
NODE_BIN=$(which node)
if [ -z "$NODE_BIN" ]; then
  echo "Node.js not found in PATH. Aborting."
  exit 1
fi

# Run the host process which keeps the listener alive
$NODE_BIN ./bin/RunnerService.js &
PID=$!
wait $PID
trap - TERM INT
wait $PID
