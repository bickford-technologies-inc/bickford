# Schema & Migration Safety

Schema evolution is governed by immutable migrations.

Rules:

- Migrations are append-only
- Existing migrations are immutable
- Schema must match migrations
- Destructive changes require declaration
- Runtime may not mutate schema

Result:
Data integrity and reproducibility are guaranteed.
