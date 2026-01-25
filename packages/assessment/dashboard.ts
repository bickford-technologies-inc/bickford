// Bickford Neuropsych Profile Dashboard Generator

import type { AssessmentResult } from "./assessment";

export function generateDashboard(results: AssessmentResult[]): string {
  const passFail = (passed: boolean) => (passed ? "✅" : "❌");
  return `# Neuropsych Profile Dashboard\n\n| Domain             | Status | Details                  | Timestamp           |\n|--------------------|--------|--------------------------|---------------------|\n${results
    .map(
      (r) =>
        `| ${r.domain.padEnd(18)} | ${passFail(r.passed)}     | ${r.details.padEnd(24)} | ${r.timestamp.slice(0, 19)} |`,
    )
    .join("\n")}\n`;
}
