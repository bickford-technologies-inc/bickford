#!/bin/bash
# Bickford GitHub Execution Authority Automation
# Run this locally where you have network access.

set -euo pipefail

REPO="bickford-technologies-inc/bickford"
GITHUB_TOKEN="${GITHUB_TOKEN:-$(cat ~/.github-token 2>/dev/null || true)}"

if [[ -z "${GITHUB_TOKEN}" ]]; then
  echo "Error: GITHUB_TOKEN not set" >&2
  echo "Set it with: export GITHUB_TOKEN=your_token" >&2
  exit 1
fi

create_execution_issue() {
  local title="$1"
  local body="$2"
  local labels_csv="${3:-execution-authority}"

  python3 - "$REPO" "$GITHUB_TOKEN" "$title" "$body" "$labels_csv" <<'PY'
import json
import os
import sys

repo, token, title, body, labels_csv = sys.argv[1:6]
labels = [label.strip() for label in labels_csv.split(",") if label.strip()]
payload = {"title": title, "body": body, "labels": labels}
print(json.dumps(payload))
PY
}

trigger_workflow() {
  local workflow="$1"
  local ref="${2:-main}"

  python3 - "$ref" <<'PY'
import json
import sys

ref = sys.argv[1]
print(json.dumps({"ref": ref}))
PY
}

create_audit_commit() {
  local filepath="$1"
  local content="$2"
  local message="$3"

  local sha
  sha=$(
    curl -s \
      -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/repos/$REPO/contents/$filepath" \
      | python3 - <<'PY'
import json
import sys

try:
    data = json.load(sys.stdin)
    print(data.get("sha", ""))
except json.JSONDecodeError:
    print("")
PY
  )

  local payload
  payload=$(
    python3 - "$message" "$content" "$sha" <<'PY'
import base64
import json
import sys

message, content, sha = sys.argv[1:4]
payload = {
    "message": message,
    "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
}
if sha:
    payload["sha"] = sha
print(json.dumps(payload))
PY
  )

  curl -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO/contents/$filepath" \
    -d "$payload"
}

get_commit_chain() {
  curl -s \
    -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/commits" \
    | python3 - <<'PY'
import json
import sys

data = json.load(sys.stdin)
for commit in data[:10]:
    message = commit["commit"]["message"].split("\n", 1)[0]
    print(f"{commit['sha'][:7]} - {message}")
PY
}

create_execution_pr() {
  local title="$1"
  local head="$2"
  local base="${3:-main}"
  local body="$4"

  local payload
  payload=$(
    python3 - "$title" "$head" "$base" "$body" <<'PY'
import json
import sys

title, head, base, body = sys.argv[1:5]
print(json.dumps({"title": title, "head": head, "base": base, "body": body}))
PY
  )

  curl -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO/pulls" \
    -d "$payload"
}

case "${1:-help}" in
  issue)
    create_execution_issue "$2" "$3" "$4" | \
      curl -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO/issues" \
        -d @-
    ;;
  workflow)
    trigger_workflow "$2" "$3" | \
      curl -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO/actions/workflows/$2/dispatches" \
        -d @-
    ;;
  audit)
    create_audit_commit "$2" "$3" "$4"
    ;;
  chain)
    get_commit_chain
    ;;
  pr)
    create_execution_pr "$2" "$3" "$4" "$5"
    ;;
  *)
    echo "Bickford GitHub Automation"
    echo ""
    echo "Usage:"
    echo "  $0 issue <title> <body> [labels]"
    echo "  $0 workflow <workflow_file> [ref]"
    echo "  $0 audit <filepath> <content> <message>"
    echo "  $0 chain"
    echo "  $0 pr <title> <head_branch> [base_branch] [body]"
    ;;
esac
