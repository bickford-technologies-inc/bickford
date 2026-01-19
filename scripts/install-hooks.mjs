import fs from "fs";

fs.mkdirSync(".git/hooks", { recursive: true });

fs.writeFileSync(
  ".git/hooks/pre-commit",
  `#!/usr/bin/env bash
set -e
node scripts/enforce-pnpm.mjs
node scripts/require-tsc.mjs
`,
);

fs.chmodSync(".git/hooks/pre-commit", 0o755);

console.log("✅ Git hooks installed");
