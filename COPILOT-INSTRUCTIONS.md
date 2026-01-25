# How to Use Bickford Custom Instructions with GitHub Copilot

## Three Ways to Configure Copilot

### Method 1: Repository-Level (Automatic) ✅ RECOMMENDED

**Location:** `.github/copilot-instructions.md`

**Setup:**
```bash
# In your Bickford repo
mkdir -p .github
cp .github-copilot-instructions.md .github/copilot-instructions.md
git add .github/copilot-instructions.md
git commit -m "Add Copilot custom instructions"
git push
```

**Benefit:** 
- Automatically applies to anyone working on Bickford
- Version controlled with code
- No manual setup per developer

**How it works:**
GitHub Copilot automatically reads `.github/copilot-instructions.md` when you're working in the repository.

---

### Method 2: User-Level (VS Code Settings)

**Location:** VS Code Settings → GitHub Copilot

**Setup:**
1. Open VS Code
2. `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type: "Preferences: Open User Settings (JSON)"
4. Add:

```json
{
  "github.copilot.advanced": {
    "inlineSuggestCount": 3,
    "customInstructions": "Bickford Project:\n- Use Bun-native APIs (Bun.file, bun:sqlite)\n- Never use Node.js fs/promises\n- Always enforce canons with hard failures (throw, never warn)\n- Append to ledger on every mutation\n- Maintain hash chain integrity\n- Dual-purpose: compliance (hash) + intelligence (embeddings)\n- TypeScript strict mode always\n- Import from @bickford/ workspace packages\n- Test with bun:test not Jest\n\nCore principle: Make failure structurally impossible, not just discouraged."
  }
}
```

**Benefit:**
- Applies to all your projects
- Persists across workspaces

**Limitation:**
- Character limit (~2000 chars)
- Use the SHORT version: `CODEX-INSTRUCTIONS-SHORT.md`

---

### Method 3: Project-Level (.vscode/settings.json)

**Location:** `.vscode/settings.json` in repo root

**Setup:**
```bash
# In your Bickford repo
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "github.copilot.advanced": {
    "customInstructions": "Read the comprehensive instructions in CODEX-INSTRUCTIONS.md. Key rules: Use Bun-native APIs only (no Node.js fs/promises), enforce canons with hard failures (throw CanonViolationError), append to ledger on every mutation, maintain hash chain integrity, dual-purpose design (compliance + intelligence), TypeScript strict mode, workspace imports (@bickford/package), test with bun:test. Principle: Make failure architecturally impossible."
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
EOF

git add .vscode/settings.json
git commit -m "Add Copilot project settings"
git push
```

**Benefit:**
- Applies to all developers on Bickford
- Can include other project settings
- Version controlled

---

## Verification

### Test That Copilot is Following Instructions

**Test 1: Bun-Native Check**
```typescript
// Type this comment:
// Read a file and return its contents

// If Copilot suggests:
const content = await Bun.file('./data.txt').text(); // ✅ CORRECT

// Instead of:
import { readFile } from 'fs/promises';
const content = await readFile('./data.txt', 'utf-8'); // ❌ WRONG
```

**Test 2: Canon Enforcement**
```typescript
// Type this comment:
// Enforce that model is in the allowed list

// If Copilot suggests:
if (!canon.allowedModels.includes(model)) {
  throw new CanonViolationError(`Model ${model} not allowed`); // ✅ CORRECT
}

// Instead of:
if (!canon.allowedModels.includes(model)) {
  console.warn('Model not allowed');
  return false; // ❌ WRONG - doesn't block execution
}
```

**Test 3: Ledger Append**
```typescript
// Type this comment:
// Log this action to the ledger

// If Copilot suggests:
await ledger.append({
  eventType: 'action_executed',
  payload: { action, result, success: true },
  embedding: await generateEmbedding(...), // ✅ Includes intelligence layer
  metadata: { processingTime: elapsed },
  timestamp: new Date().toISOString(),
}); // ✅ CORRECT

// Instead of:
console.log('Action executed:', action); // ❌ WRONG - no ledger
```

---

## Troubleshooting

### Copilot Suggestions Aren't Following Instructions

**Problem:** Copilot suggests Node.js code instead of Bun

**Fix:**
1. Verify `.github/copilot-instructions.md` exists in repo
2. Reload VS Code window: `Cmd+Shift+P` → "Developer: Reload Window"
3. Check Copilot is enabled: Look for Copilot icon in status bar
4. Explicitly reference instructions in comments:

```typescript
// Using Bun-native file API (see .github/copilot-instructions.md)
const content = await // Copilot will now suggest Bun.file()
```

### Instructions Too Long for User Settings

**Problem:** Character limit in VS Code settings

**Fix:** Use the short version:
1. Copy content from `CODEX-INSTRUCTIONS-SHORT.md`
2. Paste into VS Code settings
3. Or just use repository-level (Method 1)

### Copilot Ignoring Repository Instructions

**Problem:** `.github/copilot-instructions.md` not being read

**Fix:**
1. Ensure file is committed to repo: `git ls-files .github/copilot-instructions.md`
2. Update GitHub Copilot extension: VS Code → Extensions → GitHub Copilot → Update
3. Clear Copilot cache:
   - Mac: `~/Library/Application Support/Code/User/globalStorage/github.copilot`
   - Windows: `%APPDATA%\Code\User\globalStorage\github.copilot`
   - Delete the folder and restart VS Code

---

## Priority Order

GitHub Copilot reads instructions in this order (later overrides earlier):

1. **Repository-level** (`.github/copilot-instructions.md`)
2. **Project-level** (`.vscode/settings.json`)
3. **User-level** (VS Code global settings)

**Best practice:** Use repository-level for Bickford-specific rules, user-level for personal preferences.

---

## Pro Tips

### Inline Comments as Hints

```typescript
// Copilot responds well to explicit instructions in comments
// Use this to override suggestions:

// Using Bun, not Node.js
const data = await // → Copilot suggests Bun.file()

// Hard-fail on canon violation, don't warn
if (!valid) // → Copilot suggests throw new CanonViolationError()

// Dual-purpose: compliance + intelligence
await ledger.append({ // → Copilot includes embedding field
```

### Reference Documentation

```typescript
// See CODEX-INSTRUCTIONS.md for ledger pattern
async function appendToLedger(entry: LedgerEntry) {
  // Copilot will follow the documented pattern
```

### Reject Bad Suggestions

When Copilot suggests Node.js code:
1. Dismiss the suggestion (Esc)
2. Add comment: `// Using Bun-native API`
3. Trigger Copilot again (Tab or Ctrl+Space)
4. It should now suggest Bun version

---

## Complete Setup Checklist

**In Bickford Repository:**
- [ ] Copy `.github-copilot-instructions.md` to `.github/copilot-instructions.md`
- [ ] Copy `CODEX-INSTRUCTIONS.md` to repository root
- [ ] Create `.vscode/settings.json` with Copilot config
- [ ] Commit all files: `git add . && git commit -m "Add Copilot instructions"`
- [ ] Push: `git push`

**In VS Code:**
- [ ] Install GitHub Copilot extension
- [ ] Reload window: `Cmd+Shift+P` → "Developer: Reload Window"
- [ ] Verify Copilot is active (icon in status bar)
- [ ] Test with sample code (see Verification section)

**Optional (User Settings):**
- [ ] Open User Settings JSON
- [ ] Add custom instructions from `CODEX-INSTRUCTIONS-SHORT.md`
- [ ] Save and reload

---

## Expected Behavior

After setup, Copilot should:

✅ Suggest `Bun.file()` instead of `fs.readFile()`
✅ Suggest `bun:sqlite` instead of `sqlite3`
✅ Suggest `throw new CanonViolationError()` for violations
✅ Include `embedding` field in ledger appends
✅ Use TypeScript strict types (no `any`)
✅ Import from `@bickford/package` workspace
✅ Suggest `bun:test` for testing

❌ Never suggest Node.js fs/promises
❌ Never suggest silent error handling
❌ Never suggest mutable global state
❌ Never suggest optional enforcement (warnings)

---

## Quick Start Command

```bash
# One command to set everything up
cd /path/to/bickford
mkdir -p .github .vscode
cp /path/to/downloads/.github-copilot-instructions.md .github/copilot-instructions.md
cp /path/to/downloads/CODEX-INSTRUCTIONS.md ./
cat > .vscode/settings.json << 'EOF'
{
  "github.copilot.advanced": {
    "customInstructions": "See CODEX-INSTRUCTIONS.md and .github/copilot-instructions.md"
  }
}
EOF
git add .github/ .vscode/ CODEX-INSTRUCTIONS.md
git commit -m "Configure Copilot for Bickford patterns"
git push
```

Then reload VS Code and start coding!

---

## Success!

You'll know it's working when:
- Copilot suggests Bun APIs without prompting
- Error handling uses specific error types
- Ledger appends include embeddings
- Code follows canonical collapse principle

**Now Copilot will help build Bickford the Bickford way.** 🚀
