# Bun Migration Notice

This project has been migrated to use Bun for dependency management and scripts. All previous pnpm-specific files and configuration have been removed. Please use `bun install` and `bun run` for all development and deployment tasks.

## Key Changes
- Removed `pnpm-lock.yaml`
- Updated `package.json` scripts to use Bun
- Removed `packageManager` field from `package.json`

## Getting Started
1. Run `bun install` to install dependencies and generate `bun.lockb`.
2. Use `bun run dev`, `bun run build`, etc., for all scripts.

For any issues, see the Bun documentation: https://bun.sh/docs
