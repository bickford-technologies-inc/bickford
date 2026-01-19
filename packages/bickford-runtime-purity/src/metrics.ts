import fs from "fs";

const METRICS_FILE = "ci-metrics.json";

type MetricEvent =
  | { type: "auto_fix"; classification: string }
  | { type: "blocked"; classification: string };

export function recordMetric(event: MetricEvent) {
  let metrics: MetricEvent[] = [];
  if (fs.existsSync(METRICS_FILE)) {
    metrics = JSON.parse(fs.readFileSync(METRICS_FILE, "utf8"));
  }
  metrics.push({ ...event, ts: new Date().toISOString() } as any);
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
}
