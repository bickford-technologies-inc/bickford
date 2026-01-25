# Bickford + Bun Developer Onboarding

## Prerequisites

- Bun 1.0+ ([install](https://bun.sh))
- Node.js (fallback)
- Anthropic API key (for LLM features)

## Setup

```bash
git clone https://github.com/bickford/bickford.git
cd bickford
bun install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
bun run build
bun test
bun run dev
```

## VSCode Recommended Settings

- See `.vscode/settings.json` for Bun, TypeScript, and Prettier integration

## Pre-commit Hooks

- Lint, type-check, and test before every commit
- See `.husky/pre-commit`

## Quick Reference

- See `bun-quick-reference.md` for Node.js → Bun patterns
- See `bun-migration-guide.md` for migration steps

## Demo App

- See `apps/demo` for acquisition demo and UI starter

## Troubleshooting

- See `bun-migration-guide.md` for common issues and fixes
