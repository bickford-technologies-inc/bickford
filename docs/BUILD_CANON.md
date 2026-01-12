# Bickford Build Canon v1.1.0

## Invariants (Non-Negotiable)

1. Next.js App Router owns routing and functions
2. vercel.json must NOT define outputDirectory or functions
3. Exactly one Prisma schema exists
4. Node version pinned to 20.x
5. turbo.json declares all required env vars
6. No build artifacts committed
7. CI is the enforcement authority

Violations are build-fatal by design.

## Chat Authority (v1.1.0)

1. Chat is the sole entry point for intent.
2. All executions must trace to a ChatMessage ID.
3. Chat messages are append-only.
4. Denials are first-class, explainable, and persisted.
5. No API may execute side effects unless invoked by chat-originated intent.

Violation = build failure.
