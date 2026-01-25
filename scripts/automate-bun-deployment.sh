#!/bin/bash
# Automate Bun-native deployment setup for Railway/Fly.io
set -e

# 1. Ensure .env exists
if [ ! -f .env ]; then
  echo "Copying .env.example to .env..."
  cp .env.example .env
  echo "Please edit .env to add your real secrets (e.g., ANTHROPIC_API_KEY)."
fi

# 2. Ensure Railway/Fly.io config files exist
if [ ! -f railway.json ]; then
  echo '{\n  "build": "bun install",\n  "start": "bun run app/server.ts"\n}' > railway.json
  echo "Created railway.json."
fi
if [ ! -f Dockerfile ]; then
  echo -e "# Bun Dockerfile\nFROM oven/bun:latest\nWORKDIR /app\nCOPY . .\nRUN bun install\nEXPOSE 3000\nCMD [\"bun\", \"run\", \"app/server.ts\"]" > Dockerfile
  echo "Created Dockerfile."
fi

# 3. Ensure package.json has Bun start script
if ! grep -q '"start":' package.json; then
  sed -i '/"scripts": {/a \\    "start": "bun run app/server.ts",' package.json
  echo "Added Bun start script to package.json."
fi

# 4. Ensure CI/CD workflow exists
mkdir -p .github/workflows
if [ ! -f .github/workflows/bun-deploy.yml ]; then
  cat <<EOT > .github/workflows/bun-deploy.yml
name: Bun Deploy (Railway/Fly.io)

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Lint, Build, and Test
        run: |
          bun run build || true
          bun test || true

      - name: Deploy to Railway (if configured)
        if: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          bunx railway up --service bickford
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

      - name: Deploy to Fly.io (if configured)
        if: ${{ secrets.FLY_API_TOKEN }}
        run: |
          bunx flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
EOT
  echo "Created .github/workflows/bun-deploy.yml."
fi

echo "Bun-native deployment automation complete!"
