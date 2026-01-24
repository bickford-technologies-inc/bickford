---
applyTo: "{docs/**/*.md,*.md}"
excludeFrom: ["code-review"]
---

# Documentation Instructions

## Documentation Style

### Writing Style
- **Clear and concise**: Prefer short sentences and bullet points
- **Minimal preamble**: Get to the point quickly
- **Action-oriented**: Use imperative verbs (e.g., "Run", "Install", "Configure")
- **No ceremony**: Avoid verbose explanations unless necessary for understanding

### Structure
- Start with a brief one-line description
- Include practical examples and code snippets
- Use headings to organize content hierarchically
- Include a table of contents for long documents

## File Organization

### Root Documentation
- `README.md` - Main entry point, core concepts, quick start
- `QUICKSTART.md` - Zero-configuration getting started guide
- `WORKFLOWS.md` - CI/CD, automation, and development workflows
- `TESTING.md` - Testing strategy and conventions

### docs/ Directory
- `docs/ARCHITECTURE.md` - System architecture and design decisions
- `docs/API.md` - API reference and endpoints
- `docs/QUICKSTART.md` - Detailed quick start guide
- `docs/GITHUB_COPILOT_BEST_PRACTICES.md` - Copilot usage guidelines
- `docs/technical/` - Deep technical documentation
- `docs/adr/` - Architecture Decision Records

## Code Examples

### Command Line Examples
Always use actual commands that work in the repository:
```bash
# ✅ CORRECT - uses pnpm
pnpm run build

# ❌ WRONG - uses npm (not supported)
npm run build
```

### Code Snippets
- Use proper syntax highlighting (```typescript, ```bash, etc.)
- Include imports when showing function usage
- Show both success and error cases when relevant

## Bickford-Specific Documentation

### Terminology
- **Intent**: Natural language declaration of desired outcome
- **OPTR**: Optimal Path to Realization (execution path optimizer)
- **Canon**: SHA-256 verified execution authority layer
- **Ledger**: Append-only Postgres log of all decisions
- **Non-interference**: Multi-agent constraint (no action increases another's TTV)
- **TTV**: Time-to-Value

### Core Concepts to Emphasize
1. **Determinism**: Execution is deterministic, not probabilistic
2. **Binary outcomes**: Intent either resolves into reality, or nothing happens
3. **Minimal implementation**: Smallest possible solution
4. **No ceremony**: Silent execution paths, no approval gates

### What to Avoid
- Don't add verbose explanations or hand-holding
- Don't document internal implementation details unless necessary
- Don't create dashboard/UI documentation unless explicitly requested
- Don't document multi-step workflows with approval gates

## Maintenance

### When to Update Documentation
Update documentation when:
- Build, run, or deploy steps change
- New environment variables are required
- API endpoints are added or modified
- Core concepts or architecture change
- Workflow automation is added or changed

### Files to Update Together
When changing workflows, update these files consistently:
- `README.md` - If it affects the quick start or core concepts
- `docs/QUICKSTART.md` - If it affects the getting started process
- `docs/WORKFLOWS.md` - If it affects CI/CD or automation
- `.github/copilot-instructions.md` - If it affects how Copilot should work

## Markdown Conventions

### Headers
```markdown
# H1 - Document title (one per file)
## H2 - Major sections
### H3 - Subsections
```

### Lists
```markdown
- Use hyphens for unordered lists
- Keep list items parallel in structure
- Indent nested lists by 2 spaces

1. Use numbers for ordered lists
2. Numbers should be sequential
3. Use when order matters
```

### Code Blocks
```markdown
Use triple backticks with language identifier:
​```typescript
const example: Decision = { ... };
​```

​```bash
pnpm run build
​```
```

### Links
```markdown
[Link text](path/to/file.md) - Relative links for repo files
[Link text](https://example.com) - Absolute links for external
```

## Review Checklist

Before committing documentation changes:
- [ ] All commands use `pnpm` (not npm or yarn)
- [ ] Node version is 20.x (matches `.nvmrc`)
- [ ] Code examples follow TypeScript strict mode
- [ ] File paths are correct and exist in the repository
- [ ] Terminology is consistent with core concepts
- [ ] No verbose ceremony or unnecessary explanations
- [ ] Examples are practical and actionable
