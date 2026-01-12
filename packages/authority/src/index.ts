import { Intent, Decision } from "@bickford/types";

export function authorize(intent: Intent): Decision {
  const ts = new Date().toISOString();

  if (intent.action.toLowerCase().includes("delete")) {
    return {
      allowed: false,
      canonId: "BASE-DENY-DESTRUCTIVE",
      rationale: "Destructive actions denied by canon",
      timestamp: ts
    };
  }

  if (intent.action === "read") {
    return {
      allowed: true,
      canonId: "BASE-READ",
      rationale: "Read-only action permitted",
      timestamp: ts
    };
  }

  return {
    allowed: true,
    canonId: "BASE-WRITE",
    rationale: "Write permitted with ledgering",
    timestamp: ts
  };
}
