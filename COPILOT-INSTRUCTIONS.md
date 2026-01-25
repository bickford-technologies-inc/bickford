# GitHub Copilot Instructions for Bickford

(See .github/copilot-instructions.md for the full canonical instructions. This file is a reference copy for developers and Copilot settings.)

## Key Principles

- Use Bun-native APIs only (no Node.js fs/promises)
- Enforce canons with hard failures (throw, never warn)
- Append to ledger on every mutation
- Maintain hash chain integrity
- Dual-purpose: compliance (hash) + intelligence (embeddings)
- TypeScript strict mode always
- Import from @bickford/ workspace packages
- Test with bun:test not Jest

## See .github/copilot-instructions.md for full details and code patterns.
