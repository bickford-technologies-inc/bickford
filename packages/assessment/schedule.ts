// Bickford Assessment Scheduler
// Schedules and runs the neuropsych assessment suite periodically

import { NeuropsychAssessment } from "./assessment";
import { generateDashboard } from "./dashboard";
import { generateComplianceReport } from "./report";

// Example: schedule every 24 hours
export async function scheduleAssessment(
  assessment: NeuropsychAssessment,
  intervalMs = 24 * 60 * 60 * 1000, // 24 hours
) {
  async function runAndReport() {
    const results = await assessment.runAll();
    const dashboard = generateDashboard(results);
    const report = generateComplianceReport(results);
    // Save or export dashboard/report as needed
    console.log(dashboard);
    console.log(report);
    // TODO: Integrate with CI/CD, monitoring, or external storage
  }
  await runAndReport();
  setInterval(runAndReport, intervalMs);
}
