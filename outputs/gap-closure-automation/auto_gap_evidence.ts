/**
 * Auto Gap Evidence Generator (Bun-native)
 * Generates outreach, interview, plan, and checklist files for all non-technical gaps
 */
import { write } from "bun";

const gaps = [
  {
    id: "GAP-003",
    template: "templates/loi_request_template.md",
    evidence: "evidence/GAP-003/loi_request.md",
    replacements: { "[Customer Name]": "Acme Corp" },
  },
  {
    id: "GAP-006",
    template: "templates/customer_interview_script.md",
    evidence: "evidence/GAP-006/interview_script.md",
    replacements: {},
  },
  {
    id: "GAP-008",
    template: "templates/integration_plan_template.md",
    evidence: "evidence/GAP-008/integration_plan.md",
    replacements: {},
  },
  {
    id: "GAP-010",
    template: "templates/patent_application_checklist.md",
    evidence: "evidence/GAP-010/patent_checklist.md",
    replacements: {},
  },
  {
    id: "GAP-011",
    template: "templates/advisor_outreach_template.md",
    evidence: "evidence/GAP-011/advisor_outreach.md",
    replacements: { "[Advisor Name]": "Dr. Jane Smith" },
  },
];

async function generateEvidence() {
  for (const gap of gaps) {
    const templateText = await Bun.file(
      `outputs/gap-closure-automation/${gap.template}`,
    ).text();
    let output = templateText;
    for (const [key, value] of Object.entries(gap.replacements)) {
      output = output.replaceAll(key, value);
    }
    await write(`outputs/gap-closure-automation/${gap.evidence}`, output);
    console.log(`Generated evidence for ${gap.id}: ${gap.evidence}`);
  }
}

generateEvidence();
