import fs from "fs";
import path from "path";
import glob from "fast-glob";

const WEB_SRC = "apps/web/src";
const FORBIDDEN = [
  "@bickford/core",
  "@bickford/types",
  "@bickford/authority",
  "@bickford/canon",
  "@bickford/optr",
  "canon",
  "authority",
  "optr",
  "ledger",
];

let violations: { file: string; token: string }[] = [];

// Only scan source files, ignore node_modules, .next, .turbo, and generated types
const files = glob.sync(`${WEB_SRC}/**/*.{ts,tsx,js,jsx}`, {
  ignore: [
    "**/node_modules/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/*.d.ts",
    "**/*.generated.ts",
    "**/*.gen.ts",
    "**/__generated__/**",
    "**/types/**",
  ],
});

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");

  for (const token of FORBIDDEN) {
    if (content.includes(token)) {
      violations.push({ file, token });
    }
  }
}

if (violations.length > 0) {
  console.error("\n🚫 CANON / WORKSPACE VIOLATIONS DETECTED\n");
  violations.forEach((v) => console.error(`- ${v.file} → \"${v.token}\"`));

  console.error(`
Web UI must not assert canonical domains.
Use UI-safe placeholders or adapters.
`);
  console.error(`To fix: Remove or rename any variable, import, comment, or literal containing forbidden tokens.
See docs/INVARIANTS.md for allowed patterns and architectural law.
`);
  process.exit(1);
}

console.log("✅ Web boundary enforcement passed");
