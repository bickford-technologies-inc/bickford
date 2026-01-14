import fs from "fs";

export function getMetrics() {
  const metricsPath = ".bickford/metrics.json";
  if (!fs.existsSync(metricsPath)) return null;
  return JSON.parse(fs.readFileSync(metricsPath, "utf8"));
}
