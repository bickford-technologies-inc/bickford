import { vercel } from "./client";

export async function blockSQLi(projectId: string) {
  return vercel.security.updateFirewallConfig({
    projectId,
    requestBody: {
      action: "rules.insert",
      id: null,
      value: {
        active: true,
        name: "Block SQL Injection",
        description: "Canonical SQLi protection",
        conditionGroup: [
          {
            conditions: [{ type: "query", op: "inc", value: "SELECT" }],
          },
        ],
        action: {
          mitigate: { action: "deny" },
        },
      },
    },
  });
}
