# PROMOTION CONTRACT (CANONICAL)

Rule:
If a module is imported by more than one execution context
(app, agent, runtime, or package),
it MUST be promoted to a workspace package.

Forbidden after promotion:

- Relative imports across boundaries
- "@/lib/\*"
- "@/internal/\*"
- File-system–specific modules in apps

Required after promotion:

- Workspace package (@bickford/\*)
- package.json with main + types
- dist/ output
- Declared dependency in all consumers
- Included in Next.js transpilePackages
