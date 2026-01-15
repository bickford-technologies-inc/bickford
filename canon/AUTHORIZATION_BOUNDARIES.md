# Authorization Boundaries

All protected actions require explicit authorization context.

Rules:

- No ambient authority
- AuthContext required for mutations
- Policies centralized
- Tenant isolation enforced

Result:
Privilege escalation and cross-tenant access are structurally impossible.
