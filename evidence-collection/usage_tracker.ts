// Bun-native TypeScript: Usage Tracker for Bickford
import { writeFile } from "bun";

interface UsageEvent {
  timestamp: string;
  userId: string;
  action: string;
  details: Record<string, any>;
}

const events: UsageEvent[] = [
  {
    timestamp: new Date().toISOString(),
    userId: "demo-user-1",
    action: "api_call",
    details: { endpoint: "/v1/decision", durationMs: 120 },
  },
  {
    timestamp: new Date().toISOString(),
    userId: "demo-user-2",
    action: "api_call",
    details: { endpoint: "/v1/decision", durationMs: 98 },
  },
  {
    timestamp: new Date().toISOString(),
    userId: "demo-user-1",
    action: "report_generated",
    details: { reportType: "ROI" },
  },
];

await writeFile(
  "./evidence-collection/production_usage.jsonl",
  events.map((e) => JSON.stringify(e)).join("\n"),
);
console.log("Demo usage events written to production_usage.jsonl");
