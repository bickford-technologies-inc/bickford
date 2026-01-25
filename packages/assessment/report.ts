// Bickford Compliance Report Generator

import type { AssessmentResult } from "./assessment";

export function generateComplianceReport(results: AssessmentResult[]): string {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  return `# Compliance Report\n\n- **Date:** ${new Date().toISOString()}\n- **Passed:** ${passed} / ${total}\n\n## Details\n\n${results
    .map(
      (r) =>
        `- **${r.domain}:** ${r.passed ? "PASS" : "FAIL"} — ${r.details} (at ${r.timestamp})`,
    )
    .join("\n")}\n`;
}
