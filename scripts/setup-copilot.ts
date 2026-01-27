#!/usr/bin/env bun

/**
 * Quick Setup for GitHub Copilot Custom Instructions
 * Run this in your Bickford repo to configure Copilot
 */

console.log("🤖 Setting up GitHub Copilot for Bickford\n");

// Create .github directory
await Bun.$`mkdir -p .github .vscode`;

// Copy instructions to .github/copilot-instructions.md
console.log("Creating .github/copilot-instructions.md...");
const githubInstructions = await Bun.file(
  ".github-copilot-instructions.md",
).text();
await Bun.write(".github/copilot-instructions.md", githubInstructions);
console.log("✓ Created .github/copilot-instructions.md\n");

// Copy comprehensive docs to root
console.log("Copying documentation to root...");
await Bun.$`cp COPILOT-INSTRUCTIONS.md ./`;
await Bun.$`cp CODEX-INSTRUCTIONS.md ./`;
console.log("✓ Copied documentation\n");

// Create .vscode/settings.json
console.log("Creating .vscode/settings.json...");
const vscodeSettings = {
  "github.copilot.advanced": {
    customInstructions:
      "See .github/copilot-instructions.md and COPILOT-INSTRUCTIONS.md for Bickford development patterns. Key: Use Bun-native APIs, enforce canons with hard failures, append to ledger on every mutation, maintain hash chain integrity.",
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
  },
};

await Bun.write(
  ".vscode/settings.json",
  `${JSON.stringify(vscodeSettings, null, 2)}\n`,
);
console.log("✓ Created .vscode/settings.json\n");

console.log("═══════════════════════════════════════════════════════════");
console.log("  Setup Complete!");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("Files created:");
console.log("  .github/copilot-instructions.md  (auto-read by Copilot)");
console.log("  .vscode/settings.json            (project settings)");
console.log("  COPILOT-INSTRUCTIONS.md          (reference docs)");
console.log("  CODEX-INSTRUCTIONS.md            (detailed guide)\n");

console.log("Next steps:");
console.log('  1. Reload VS Code: Cmd+Shift+P → "Developer: Reload Window"');
console.log("  2. Verify Copilot is active (icon in status bar)");
console.log(
  '  3. Test: Type a comment "// Read a file" and see if Copilot suggests Bun.file()\n',
);

console.log("To commit:");
console.log("  git add .github/ .vscode/ *.md");
console.log('  git commit -m "Configure Copilot for Bickford patterns"');
console.log("  git push\n");
