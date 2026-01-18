ROLE=$1

if [ -z "$ROLE" ]; then
  echo "Usage: agent-guard <role>"
  exit 1
fi

echo "Agent role locked to: $ROLE"
pnpm run preflight || exit 1
