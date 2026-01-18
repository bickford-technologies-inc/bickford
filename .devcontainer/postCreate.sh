#!/usr/bin/env bash
set -e

echo "🔧 Enabling corepack"
corepack enable

echo "📦 Activating pnpm 10.x"
corepack prepare pnpm@10.0.0 --activate

echo "🧹 Ensuring no stray config"
rm -f ~/.npmrc ~/.pnpmrc || true

echo "📥 Installing dependencies"
pnpm install

echo "✅ Codespace ready"
