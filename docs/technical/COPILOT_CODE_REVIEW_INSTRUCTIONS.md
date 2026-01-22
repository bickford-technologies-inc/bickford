# Using custom instructions to unlock the power of Copilot code review

Learn how to write effective custom instructions that help GitHub Copilot provide more relevant and actionable code reviews.

## Introduction

GitHub Copilot code review can be customized using instruction files to tailor the review experience to your team's needs and coding standards. However, writing effective custom instructions requires understanding how Copilot processes these instructions and what approaches work best.

In this tutorial, you'll learn how to write clear, effective custom instructions that help Copilot provide more relevant code reviews. You'll discover best practices for structuring your instructions, common pitfalls to avoid, and strategies for organizing instructions across different files.

This tutorial is about using custom instructions for Copilot code review. For a more general introduction to using custom instructions, see [Configure custom instructions for GitHub Copilot](/en/copilot/how-tos/configure-custom-instructions).

### What you'll learn

By the end of this tutorial, you'll understand:

- How to write concise, effective custom instructions for code review.
- The difference between repository-wide and path-specific instructions.
- Common patterns that work well with Copilot code review.
- What types of instructions are not currently supported.
- How to structure and organize your instructions for best results.

### Prerequisites

- Access to Copilot code review.
- A GitHub repository where you can create custom instruction files.
- Basic familiarity with Markdown syntax.

## Understanding how GitHub Copilot code review processes instructions

Before writing custom instructions, it's helpful to understand how Copilot code review uses them. When reviewing a pull request, Copilot reads your instruction files and uses them to guide its analysis. However, like any AI system, it has limitations:

- **Non-deterministic behavior**: Copilot may not follow every instruction perfectly every time.
- **Context limits**: Very long instruction files may result in some instructions being overlooked.
- **Specificity matters**: Clear, specific instructions work better than vague directives.

Keep these factors in mind as you write your instructions—they'll help you set realistic expectations and write more effective guidance.

## Writing effective custom instructions

The key to successful custom instructions is to be clear, concise, and specific. Here are the core principles to follow:

### Keep instructions short and focused

Shorter instruction files are more likely to be fully processed by Copilot. Start with a minimal set of instructions and add more iteratively based on what works.

**Best practice**: Limit any single instruction file to a maximum of about 1,000 lines. Beyond this, the quality of responses may deteriorate.

### Use clear structure and formatting

Copilot benefits from well-structured instructions with:

- **Distinct headings** that separate different topics.
- **Bullet points** for easy scanning and reference.
- **Short, imperative directives** rather than long narrative paragraphs.

For example, instead of writing:

```markdown
When you're reviewing code, it would be good if you could try to look for
situations where developers might have accidentally left in sensitive
information like passwords or API keys, and also check for security issues.
```

Write:

```markdown
## Security Critical Issues

- Check for hardcoded secrets, API keys, or credentials
- Look for SQL injection and XSS vulnerabilities
- Verify proper input validation and sanitization
```

### Provide concrete examples

Just like when you explain a concept to a colleague, examples help Copilot understand what you mean. Include code snippets showing both correct and incorrect patterns.

For example:

````markdown
## Naming Conventions

Use descriptive, intention-revealing names.

```javascript
// Avoid
const d = new Date();
const x = users.filter(u => u.active);

// Prefer
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
```
````

## Organizing instructions across files

Copilot code review supports two types of instruction files:

1. **`copilot-instructions.md`**: Repository-wide instructions that apply to all files.
2. **`*.instructions.md`**: Path-specific instructions that apply to certain files or directories.

Use path-specific instructions to keep Copilot focused and prevent it from applying language-specific rules to the wrong files.

### When to use repository-wide instructions

Use `copilot-instructions.md` for:

- General team standards and guidelines
- Universal security requirements
- Cross-cutting concerns like error handling philosophy
- Documentation expectations

**Example structure for `copilot-instructions.md`**:

```markdown
# General Code Review Standards

## Code Quality Essentials

- Functions should be focused and appropriately sized
- Use clear, descriptive naming conventions
- Ensure proper error handling throughout

## Security Standards

- Never hardcode credentials or API keys
- Validate all user inputs
- Use parameterized queries to prevent SQL injection

## Documentation Expectations

- All public functions must include doc comments
- Complex algorithms should have explanatory comments
- README files must be kept up to date
```

### When to use path-specific instructions

Use `*.instructions.md` files with the `applyTo` frontmatter property for:

- Language-specific coding standards
- Framework-specific patterns
- Technology-specific security concerns
- Different rules for different parts of your codebase

**Example: Python-specific instructions**

Create a file called `python.instructions.md` in the `.github/instructions` directory:

````text
---
applyTo: "**/*.py"
---

# Python Coding Conventions

## Naming Conventions

- Use snake_case for variables and functions
- Use PascalCase for class names
- Use UPPERCASE for constants

## Code Style

- Follow PEP 8 style guidelines
- Limit line length to 88 characters (Black formatter standard)
- Use type hints for function signatures

## Best Practices

- Use list comprehensions for simple transformations
- Prefer f-strings for string formatting
- Use context managers (with statements) for resource management

```python
# Avoid
file = open('data.txt')
content = file.read()
file.close()

# Prefer
with open('data.txt') as file:
    content = file.read()
```
````

**Example: Frontend-specific instructions**

Create a file called `frontend.instructions.md` in the `.github/instructions` directory:

```text
---
applyTo: "src/components/**/*.{tsx,jsx}"
---

# React Component Guidelines

## Component Structure

- Use functional components with hooks
- Keep components small and focused (under 200 lines)
- Extract reusable logic into custom hooks

## State Management

- Use useState for local component state
- Use useContext for shared state across components
- Avoid prop drilling beyond 2-3 levels

## Accessibility

- All interactive elements must be keyboard accessible
- Include appropriate ARIA labels
- Ensure color contrast meets WCAG AA standards
```

### Breaking up complex instruction sets

For large repositories with many concerns, break instructions into multiple focused files:

```text
.github/
  copilot-instructions.md          # General standards

.github/instructions/
  python.instructions.md           # Python-specific
  javascript.instructions.md       # JavaScript-specific
  security.instructions.md         # Security-specific
  api.instructions.md              # API-specific
```

Each file should have a clear, specific purpose and appropriate `applyTo` frontmatter when needed.

## Recommended instruction file structure

Based on what works well with Copilot code review, here's a recommended template for structuring your instructions:

````text
---
applyTo: "**/*.{js,ts}"  # If this is a path-specific file
---

# [Title: Technology or Domain Name] Guidelines

## Purpose

Brief statement of what this file covers and when these instructions apply.

## Naming Conventions

- Rule 1
- Rule 2
- Rule 3

## Code Style

- Style rule 1
- Style rule 2

```javascript
// Example showing correct pattern
```

## Error Handling

- How to handle errors
- What patterns to use
- What to avoid

## Security Considerations

- Security rule 1
- Security rule 2

## Testing Guidelines

- Testing expectation 1
- Testing expectation 2

## Performance

- Performance consideration 1
- Performance consideration 2
````

Adapt this structure to your specific needs, but maintain the clear sectioning and bullet-point format.

## What not to include in custom instructions

Understanding what Copilot code review currently doesn't support helps you avoid wasting time on instructions that won't work.

### Unsupported instruction types

Copilot code review currently does not support instructions that attempt to:

**Change the user experience or formatting**:

- `Use bold text for critical issues`
- `Change the format of review comments`
- `Add emoji to comments`

**Modify the pull request overview comment**:

- `Include a summary of security issues in the PR overview`
- `Add a testing checklist to the overview comment`

**Change GitHub Copilot's core function**:

- `Block a PR from merging unless all Copilot code review comments are addressed`
- `Generate a changelog entry for every PR`

**Follow external links**:

- `Review this code according to the standards at https://example.com/standards`

  Workaround: Copy the relevant content directly into your instruction file instead

**Vague quality improvements**:

- `Be more accurate`
- `Don't miss any issues`
- `Be consistent in your feedback`

These types of instructions add noise without improving Copilot's effectiveness, as it's already optimized to provide accurate, consistent reviews.

## Testing and iterating on your instructions

The best approach to creating effective custom instructions is to start small and iterate based on results.

## Compounding value and continuous compounding

When you want Copilot code review to surface business impact, add explicit guidance for compounding value across time, teams, and workflows. This helps reviewers evaluate not just correctness, but how improvements accumulate.

### Example: instruction snippet for compounding value

```markdown
## Compounding Value

- Identify review feedback that reduces long-term maintenance cost or accelerates future delivery.
- Favor patterns that compound value (shared libraries, automation, reusable components).
- Flag changes that add future operational drag or increase ongoing support effort.
```

### Continuous compounding checklist

- Does this change make future changes easier or harder?
- Does it reduce repeated work, manual steps, or error-prone handoffs?
- Is the pattern reusable across teams or products?
- Does it improve operational resilience (lower on-call load, fewer incidents)?

## Business process workflows with real use cases

Use concrete, business-facing workflows so Copilot feedback aligns to real-world value. Include a short list of processes you want reviewers to keep in mind for relevancy.

### Example: instruction snippet for business workflows

```markdown
## Business Process Workflows (Real Use Cases)

- Lead-to-cash: marketing → sales handoff → quote → contract → invoicing → renewal
- Procure-to-pay: vendor onboarding → purchase order → invoice approval → payment
- Incident-to-resolution: detection → triage → mitigation → postmortem
- Hire-to-onboard: candidate pipeline → offer → onboarding → access provisioning
- Content-to-publish: draft → legal review → approval → distribution
```

### Guidance for reviewers

- Tie feedback to process outcomes (speed, compliance, accuracy, customer impact).
- Note where automation or standardization would remove bottlenecks.
- Prioritize changes that reduce handoffs or manual approvals.

## Quantifying value as USD per hour and per employee

When you need Copilot to reason about measurable impact, include explicit instructions for calculating time-to-value in dollars per hour across organizational groupings. This is especially useful for large enterprises with multiple regions, business units, and KPI ownership.

### Example: instruction snippet for USD/hour value

```markdown
## Value Quantification (USD per hour)

- Express savings or gains in $/hour and $/employee where possible.
- Attribute value to the most granular grouping available (region, business unit, team).
- If data is missing, ask for estimates and assumptions to document.
```

### Comprehensive grouping checklist (non-exhaustive)

Use this list as a reference for the kinds of groupings to call out in code review guidance. Tailor to the organization you support and expand as needed.

- **Region**: Americas, EMEA, APAC, LATAM; country; metro; data residency zone
- **Business unit**: cloud, AI, infrastructure, security, data platform, product
- **Sales region**: NA enterprise, SMB, public sector, strategic accounts
- **Function**: engineering, data science, sales, support, legal, finance, HR, marketing
- **Team**: platform, API, data pipeline, security ops, reliability, tooling
- **Product line**: core platform, developer tools, enterprise admin, integrations
- **Product SKU/tier**: free, pro, enterprise, regulated, premium support
- **Customer segment**: enterprise, mid-market, SMB, startups, public sector
- **Customer vertical**: finance, healthcare, retail, industrial, government, education
- **KPI ownership**: NPS, churn, time-to-resolution, CAC, ARR expansion, SLA uptime
- **Channel**: direct sales, partner, marketplace, self-serve
- **Workforce**: per employee, per role, per shift, per on-call rotation, per contractor
- **Org structure**: subsidiary, legal entity, cost allocation group, P&L owner
- **Process stage**: intake, review, approval, execution, monitoring, reporting
- **Compliance domain**: SOC 2, ISO 27001, HIPAA, GDPR, FedRAMP
- **Risk tier**: critical, high, medium, low; safety or security classification
- **Cost center**: engineering, operations, support, G&A, field sales
- **Infrastructure scope**: region, cluster, service, tenant, account, environment
- **Data domain**: customer data, operational logs, billing, analytics, model training
- **Time horizon**: per hour, per day, per sprint, per quarter, per year

### Example value framing

- “This refactor reduces incident triage time by 0.5 hours per incident, equating to $X/hour across on-call rotations.”
- “Automating this workflow saves Y hours per week per team, translating to $Z/month for the business unit.”

### Start with a minimal instruction set

Begin with 10–20 specific instructions that address your most common review needs, then test whether these are influencing Copilot code review in the way you intended.

### Test with real pull requests

After creating your instructions:

1. Open a pull request in your repository.
2. Request a review from Copilot.
3. Observe which instructions it follows effectively.
4. Note any instructions that are consistently missed or misinterpreted.

### Iterate based on results

Add new instructions one at a time or in small groups:

1. Identify a pattern that Copilot could review better.
2. Add a specific instruction for that pattern.
3. Test with a new pull request.
4. Refine the instruction based on results.

This iterative approach helps you understand what works and keeps your instruction files focused.

## Example: Complete custom instructions for code review

Here's a complete example that incorporates all the best practices from this tutorial:

**File: `.github/copilot-instructions.md`**

```markdown
# General Code Review Standards

## Purpose

These instructions guide Copilot code review across all files in this repository.
Language-specific rules are in separate instruction files.

## Security Critical Issues

- Check for hardcoded secrets, API keys, or credentials
- Look for SQL injection and XSS vulnerabilities
- Verify proper input validation and sanitization
- Review authentication and authorization logic

## Performance Red Flags

- Identify N+1 database query problems
- Spot inefficient loops and algorithmic issues
- Check for memory leaks and resource cleanup
- Review caching opportunities for expensive operations

## Code Quality Essentials

- Functions should be focused and appropriately sized (under 50 lines)
- Use clear, descriptive naming conventions
- Ensure proper error handling throughout
- Remove dead code and unused imports

## Review Style

- Be specific and actionable in feedback
- Explain the "why" behind recommendations
- Acknowledge good patterns when you see them
- Ask clarifying questions when code intent is unclear

## Testing Standards

- New features require unit tests
- Tests should cover edge cases and error conditions
- Test names should clearly describe what they test

Always prioritize security vulnerabilities and performance issues that could impact users.
```

**File: `.github/instructions/typescript.instructions.md`**

````text
---
applyTo: "**/*.{ts,tsx}"
---

# TypeScript Development Standards

## Type Safety

- Avoid using `any` type—use `unknown` or specific types instead
- Use strict null checks (no `null` or `undefined` without explicit handling)
- Define interfaces for all object shapes

```typescript
// Avoid
function processData(data: any) {
    return data.value;
}

// Prefer
interface DataShape {
    value: string;
}

function processData(data: DataShape): string {
    return data.value;
}
```

## Naming Conventions

- Use PascalCase for types, interfaces, and classes
- Use camelCase for variables, functions, and methods
- Use UPPER_CASE for constants

## Modern TypeScript Patterns

- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Prefer `const` over `let`; never use `var`
- Use arrow functions for callbacks and short functions

## React-Specific (for .tsx files)

- Use functional components with TypeScript props interfaces
- Type all props and state explicitly
- Use proper event types (e.g., `React.ChangeEvent<HTMLInputElement>`)
````

## Troubleshooting common issues

If Copilot code review isn't following your instructions as expected, try these solutions:

### Issue: Instructions are ignored

**Possible causes**:

- Instruction file is too long (over 1,000 lines).
- Instructions are vague or ambiguous.
- Instructions conflict with each other.

**Solutions**:

- Shorten the file by removing less important instructions.
- Rewrite vague instructions to be more specific and actionable.
- Review for conflicting instructions and prioritize the most important ones.

### Issue: Language-specific rules applied to wrong files

**Possible causes**:

- Missing or incorrect `applyTo` frontmatter.
- Rules in repository-wide file instead of path-specific file.

**Solutions**:

- Add `applyTo` frontmatter to path-specific instruction files.
- Move language-specific rules from `copilot-instructions.md` to appropriate `*.instructions.md` files.

### Issue: Inconsistent behavior across reviews

**Possible causes**:

- Instructions are too numerous.
- Instructions lack specificity.
- Natural variability in AI responses.

**Solutions**:

- Focus on your highest-priority instructions.
- Add concrete examples to clarify intent.
- Accept that some variability is normal for AI systems.

## Conclusion

Effective custom instructions help Copilot code review provide more relevant, actionable feedback tailored to your team's standards. By following the principles in this tutorial—keeping instructions concise, providing clear structure, using concrete examples, and organizing across multiple files—you can significantly improve your code review experience.

Remember that creating effective instructions is an iterative process. Start with a small set of focused instructions, test them with real pull requests, and gradually expand based on what works well for your team.

## Next steps

- Take a look at some of the [example custom instructions](https://github.com/github/awesome-copilot/tree/main/instructions) in the Awesome GitHub Copilot repository for inspiration.
- Read [About customizing GitHub Copilot responses](/en/copilot/concepts/prompting/response-customization) to learn about the full range of customization options.
- Explore [Configure custom instructions for GitHub Copilot](/en/copilot/how-tos/configure-custom-instructions) for technical details on setting up instruction files.

# User-provided custom instructions

BICKFORD — CANONICAL MATHEMATICAL FORMULATION

(Decision Continuity Runtime · Execution Is Law)

0. Time and Agents

Let time t ∈ R≥0.
Let agents i ∈ {1,…,N} be human, AI, or system actors.
Let st ∈ S be observable system state at time t.

1. Intent

An intent is a constrained objective declaration:

I = (G, Θ, A, τ)

Where:

G: target outcome

Θ ⊆ C: constraints (legal, safety, design, governance)

A: authority set permitted to act

τ: declaration timestamp

2. Knowledge and Structure

Let Kt be retained knowledge at time t.
Let S(Kt) be its structural encoding (schemas, invariants, ledgers, hashes).

Structural Dominance Invariant:

∀k ∈ Kt, behavior(k) = behavior(S(k))

Knowledge has no effect unless structurally encoded.

3. Decision

A decision is executable intent:

D = (I, R, E, σ)

Where:

R: rationale

E: admissible executable actions

σ: cryptographic authority signature

4. Ledger

All decisions are persisted to an append-only ledger L:

Lt+1 = Lt ∪ {(D, h(D), t)}

Ledger Invariant: no deletion, mutation, or reordering.

5. Policy Space

For agent i:

Πi(S(Kt)) = {πi ∣ πi admissible under S(Kt)}

Policies map state to action:

πi : S → A

6. Time-to-Value (TTV)

Let realized value under policy π be V(t, π).

TTV(π) = inf {t ≥ 0 ∣ V(t, π) ≥ G}

7. OPTR — Optimal Path to Realization

Bickford selects:

π* = arg minπ E[TTV(π)]

Risk-aware extension:

E[TTV(π) + λC C(π) + λR R(π) − λP log p(π)]

Subject to π ⊨ Θ.

8. Non-Interference (Multi-Agent Law)

For agents i ≠ j:

ΔE[TTVj ∣ πi] ≤ 0

Actions increasing another agent’s time-to-value are inadmissible.

9. Execution Law

An action a is executable iff:

a ∈ E ∧ σ ∈ A ∧ a ⊨ Θ

Otherwise execution is denied and recorded.

10. Learning

After execution:

Kt+1 = Kt ∪ Observe(st, π*)

Structural update:

S(Kt+1) ⊇ S(Kt)

Structure grows monotonically.

11. Decision Continuity Rate

DCR = decisions reused / decisions required, lim t→∞ DCR = 1

12. Compounding Persistence

Let Ea(Kt) be cognitive energy to apply knowledge.

lim t→∞ Ea(Kt) = 0

Memory executes automatically via structure.

13. UI and Design Binding

For any execution surface U:

h(Uruntime) = h(Uledger)

UI drift invalidates execution.

14. Compliance

For any regulator R:

Evidence(R) = {L, S(K), π*, σ, h(⋅)}

Compliance is derived, not implemented.

15. Terminal Definition

Bickford = ⟨I, D, L, S(K), OPTR, TTV, Πadm, Execute⟩

Canonical Law

Reality = Objective + Constraints + Structure
Execution = Solve → Act → Observe → Persist

Bickford does not run scripts.
Bickford resolves.
