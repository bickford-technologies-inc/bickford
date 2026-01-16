#!/usr/bin/env node

const requiredMajor = 20;

const version = process.versions.node; // e.g. "20.11.1"
const major = Number(version.split(".")[0]);

if (major !== requiredMajor) {
  console.error(`
⛔️ CANON VIOLATION: INVALID NODE VERSION

Required: Node ${requiredMajor}.x
Detected: Node ${version}

This repository is NOT compatible with this Node version.
Refusing to continue.

Fix:
- Local: use nvm and set Node ${requiredMajor}
- CI/Vercel: set NODE_VERSION=${requiredMajor}
`);
  process.exit(1);
}

console.log(`✅ Node version ${version} satisfies canonical requirement.`);
