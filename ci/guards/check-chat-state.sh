#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

search() {
  if command -v rg >/dev/null 2>&1; then
    rg -n "$1" "$2"
  else
    grep -n "$1" "$2"
  fi
}

require_file() {
  local target="$1"
  if [[ ! -f "$ROOT_DIR/$target" ]]; then
    echo "[chat-state] missing required file: $target"
    exit 1
  fi
}

require_pattern() {
  local pattern="$1"
  local target="$2"
  if ! search "$pattern" "$ROOT_DIR/$target" >/dev/null 2>&1; then
    echo "[chat-state] missing required pattern '$pattern' in $target"
    exit 1
  fi
}

require_file "packages/ledger/src/conversationStore.ts"
require_file "packages/types/src/conversation.ts"
require_file "app/api/chat/route.ts"
require_file "app/chat/page.tsx"

require_pattern "buildTranscript" "app/api/chat/route.ts"
require_pattern "conversationId" "app/api/chat/route.ts"
require_pattern "conversationId" "app/chat/page.tsx"
require_pattern "trace" "app/chat/page.tsx"

printf "[chat-state] chat state guard passed\n"
