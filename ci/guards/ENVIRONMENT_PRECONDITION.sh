#!/usr/bin/env bash
set -e

echo "🔍 Environment preflight"

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")


# Exit 10: Node version mismatch
if [ "$NODE_MAJOR" != "20" ]; then
  echo "⛔ Node version invalid: $(node -v)"
  exit 10
fi

echo "✅ Node OK"


# Exit 20: Registry transport failure
node - <<'EOF'
import https from 'https';
https.get('https://registry.npmjs.org/react', res => {
  if (res.statusCode !== 200) {
    console.error('⛔ Registry transport failure');
    process.exit(20);
  }
  console.log('✅ Registry transport OK');
});
EOF
