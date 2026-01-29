import React from "react";

const content = `## Overview\n\nThis package contains all production-ready Claude+Bickford customer workflow artifacts for Anthropic, investors, and customer demos.\n\n---\n\n## File Inventory\n\n1. CUSTOMER_WORKFLOWS_AND_VALUE.md – Full workflows (30+ pages)\n2. WORKFLOW_DIAGRAMS.md – Visual diagrams (ASCII art)\n3. CUSTOMER_VALUE_EXECUTIVE_SUMMARY.md – One-pager (print-ready)\n4. PITCH_SCRIPT_CUSTOMER_WORKFLOWS.md – 15-min presentation script\n5. CUSTOMER_WORKFLOWS_PACKAGE_SUMMARY.md – This overview\n\n---\n\n## Usage Instructions\n\n- **Anthropic Pitch:** Read executive summary, study pitch script, print summary, screen-share diagrams, deep-dive workflows for Q&A.\n- **Customer Demos:** Pick relevant archetype, show before/after, quantify value, close with "This is what Anthropic+Bickford enables."\n- **Investor Pitches:** Lead with executive summary, deep-dive 2-3 workflows, show architecture, close with market/moat.\n\n---\n\n## Quick Start\n\n1. Open CUSTOMER_VALUE_EXECUTIVE_SUMMARY.md for 1-page reference.\n2. Use PITCH_SCRIPT_CUSTOMER_WORKFLOWS.md for meetings.\n3. Share WORKFLOW_DIAGRAMS.md during presentations.\n4. Deep-dive with CUSTOMER_WORKFLOWS_AND_VALUE.md as needed.\n\n---\n\n**All files are ready for immediate use.**`;

export default function CustomerWorkflowsSummary() {
  return (
    <div
      style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: 24 }}
    >
      <h1>Customer Workflows Package Summary</h1>
      <pre>{content}</pre>
    </div>
  );
}
