# Manage Claude Code Memory

Learn how to manage Claude Code’s memory across sessions with different memory locations and best practices.

## Determine memory type

Claude Code offers four memory locations in a hierarchical structure, each serving a different purpose.

| Memory Type | Location | Purpose | Use Case Examples | Shared With |
| --- | --- | --- | --- | --- |
| Managed policy | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`<br>Linux: `/etc/claude-code/CLAUDE.md`<br>Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | Organization-wide instructions managed by IT/DevOps | Company coding standards, security policies, compliance requirements | All users in organization |
| Project memory | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team-shared instructions for the project | Project architecture, coding standards, common workflows | Team members via source control |
| Project rules | `./.claude/rules/*.md` | Modular, topic-specific project instructions | Language-specific guidelines, testing conventions, API standards | Team members via source control |
| User memory | `~/.claude/CLAUDE.md` | Personal preferences for all projects | Code styling preferences, personal tooling shortcuts | Just you (all projects) |
| Project memory (local) | `./CLAUDE.local.md` | Personal project-specific preferences | Sandbox URLs, preferred test data | Just you (current project) |

Claude Code loads memory files in precedence order. Files higher in the hierarchy take precedence and are loaded first, providing a foundation that more specific memories build upon.

`CLAUDE.local.md` files are automatically added to `.gitignore`, making them ideal for private project-specific preferences that should not be checked into version control.

## CLAUDE.md imports

`CLAUDE.md` files can import additional files using `@path/to/import` syntax. The following example imports three files.

```md
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
- git workflow @docs/git-instructions.md

# Individual Preferences
- @~/.claude/my-project-instructions.md
```

Imports are an alternative to `CLAUDE.local.md` that work better across multiple git worktrees. Imports are not evaluated inside markdown code spans and code blocks.

Imported files can recursively import additional files, with a max-depth of five hops. You can see what memory files are loaded by running the `/memory` command.

## How Claude looks up memories

Claude Code reads memories recursively: starting in the current working directory, Claude Code recurses up to (but not including) the root directory `/` and reads any `CLAUDE.md` or `CLAUDE.local.md` files it finds. This supports repos with multiple nested instruction files (for example, `foo/CLAUDE.md` and `foo/bar/CLAUDE.md`).

Claude Code also discovers `CLAUDE.md` nested in subtrees under your current working directory. Instead of loading them at launch, they are only included when Claude reads files in those subtrees.

## Directly edit memories with /memory

Use the `/memory` command during a session to open any memory file in your system editor for more extensive additions or organization.

## Set up project memory

If you want to store important project information, conventions, and frequently used commands, project memory can be stored in either `./CLAUDE.md` or `./.claude/CLAUDE.md`.

Bootstrap a `CLAUDE.md` for your codebase with the following command:

```
/init
```

Tips:

- Include frequently used commands (build, test, lint) to avoid repeated searches.
- Document code style preferences and naming conventions.
- Add important architectural patterns specific to your project.

`CLAUDE.md` memories can be used for both instructions shared with your team and for individual preferences.

## Modular rules with .claude/rules/

For larger projects, you can organize instructions into multiple files using the `.claude/rules/` directory. This allows teams to maintain focused, well-organized rule files instead of one large `CLAUDE.md`.

### Basic structure

Place markdown files in your project’s `.claude/rules/` directory:

```
your-project/
├── .claude/
│   ├── CLAUDE.md           # Main project instructions
│   └── rules/
│       ├── code-style.md   # Code style guidelines
│       ├── testing.md      # Testing conventions
│       └── security.md     # Security requirements
```

All `.md` files in `.claude/rules/` are automatically loaded as project memory, with the same priority as `.claude/CLAUDE.md`.

### Path-specific rules

Rules can be scoped to specific files using YAML frontmatter with the `paths` field. These conditional rules only apply when Claude is working with files matching the specified patterns.

```md
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation.
- Use the standard error response format.
- Include OpenAPI documentation comments.
```

Rules without a `paths` field are loaded unconditionally and apply to all files.

### Glob patterns

The `paths` field supports standard glob patterns.

| Pattern | Matches |
| --- | --- |
| `**/*.ts` | All TypeScript files in any directory |
| `src/**/*` | All files under `src/` directory |
| `*.md` | Markdown files in the project root |
| `src/components/*.tsx` | React components in a specific directory |

You can specify multiple patterns:

```md
---
paths:
  - "src/**/*.ts"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---
```

Brace expansion is supported for matching multiple extensions or directories:

```md
---
paths:
  - "src/**/*.{ts,tsx}"
  - "{src,lib}/**/*.ts"
---
```

This expands `src/**/*.{ts,tsx}` to match both `.ts` and `.tsx` files.

### Subdirectories

Rules can be organized into subdirectories for better structure:

```
.claude/rules/
├── frontend/
│   ├── react.md
│   └── styles.md
├── backend/
│   ├── api.md
│   └── database.md
└── general.md
```

All `.md` files are discovered recursively.

### Symlinks

The `.claude/rules/` directory supports symlinks, allowing you to share common rules across multiple projects.

```bash
# Symlink a shared rules directory
ln -s ~/shared-claude-rules .claude/rules/shared

# Symlink individual rule files
ln -s ~/company-standards/security.md .claude/rules/security.md
```

Symlinks are resolved and their contents are loaded normally. Circular symlinks are detected and handled gracefully.

## User-level rules

You can create personal rules that apply to all your projects in `~/.claude/rules/`:

```
~/.claude/rules/
├── preferences.md    # Your personal coding preferences
└── workflows.md      # Your preferred workflows
```

User-level rules are loaded before project rules, giving project rules higher priority.

## Best practices for .claude/rules/

- Keep rules focused: each file should cover one topic (for example, `testing.md`, `api-design.md`).
- Use descriptive filenames: the filename should indicate what the rules cover.
- Use conditional rules sparingly: only add `paths` frontmatter when rules truly apply to specific file types.
- Organize with subdirectories: group related rules (for example, `frontend/`, `backend/`).

## Organization-level memory management

Organizations can deploy centrally managed `CLAUDE.md` files that apply to all users.

To set up organization-level memory management:

1. Create the managed memory file at the Managed policy location shown in the memory types table above.
2. Deploy via your configuration management system (MDM, Group Policy, Ansible, etc.) to ensure consistent distribution across all developer machines.

## Memory best practices

- Be specific: “Use 2-space indentation” is better than “Format code properly”.
- Use structure to organize: format each individual memory as a bullet point and group related memories under descriptive markdown headings.
- Review periodically: update memories as your project evolves to ensure Claude is always using the most up to date information and context.
