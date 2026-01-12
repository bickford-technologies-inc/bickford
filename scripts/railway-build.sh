#!/usr/bin/env bash

set -euo pipefail

echo "railway-build: node=$(node -v) npm=$(npm -v)"

echo "railway-build: build:types"
npm run build:types

echo "railway-build: prisma generate"
npx prisma generate

echo "railway-build: build:web"
npm run build:web
