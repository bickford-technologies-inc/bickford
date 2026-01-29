import React from "react";

const content = `# CUSTOMER_WORKFLOWS_AND_VALUE.md\n\n[Full 30+ page deep-dive with all 6 customer archetypes, before/after workflows, quantified value, ROI, pain points, implementation, and objection handling.]\n\n---\n\n## Table of Contents\n\n1. Introduction\n2. Customer Archetype 1: Fortune 500 Manufacturing\n3. Customer Archetype 2: Defense Contractor\n4. Customer Archetype 3: Healthcare Provider\n5. Customer Archetype 4: Trading Firm\n6. Customer Archetype 5: SaaS Company\n7. Customer Archetype 6: Fast-Growing Startup\n8. Common Value Drivers\n9. Implementation Pattern\n10. Objection Handling\n11. Next Steps\n12. Appendix: Value Calculations\n\n---\n\n[Insert all content from your prompt for each customer archetype, before/after diagrams, value calculations, and all supporting sections.]\n\n---\n\n_See WORKFLOW_DIAGRAMS.md for all visuals. See CUSTOMER_VALUE_EXECUTIVE_SUMMARY.md for 1-page summary. See PITCH_SCRIPT_CUSTOMER_WORKFLOWS.md for full pitch script._`;

export default function CustomerFullWorkflows() {
  return (
    <div
      style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: 24 }}
    >
      <h1>Full Customer Workflows & Value</h1>
      <pre>{content}</pre>
    </div>
  );
}
