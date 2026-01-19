#!/usr/bin/env bash
set -e

node scripts/auto-repair.mjs
pnpm preflight
