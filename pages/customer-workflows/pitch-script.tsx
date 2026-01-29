import React from "react";

const content = `# PITCH_SCRIPT_CUSTOMER_WORKFLOWS.md\n\n[15-20 minute word-for-word pitch script for Anthropic leadership, with slide cues, Q&A, follow-up emails, and key talking points.]\n\n---\n\n## Opening\n\n[Insert opening hook, context, and transition.]\n\n## Customer 1: Fortune 500 Manufacturing\n\n[Insert script for this customer, with slide cues and value quantification.]\n\n## Customer 2: Defense Contractor\n\n[Insert script for this customer, with slide cues and value quantification.]\n\n## Customer 3: Healthcare\n\n[Insert script for this customer, with slide cues and value quantification.]\n\n## Customers 4-6: Rapid Fire\n\n[Insert scripts for Trading Firm, SaaS Company, Startup.]\n\n## Summary Across All 6 Customers\n\n[Insert summary table, value drivers, architecture, and strategic impact.]\n\n## The Ask\n\n[Insert acquisition proposal, alternatives, and closing.]\n\n## Q&A Preparation\n\n[Insert expected questions and answers.]\n\n## Post-Meeting Follow-Up\n\n[Insert 3 follow-up email templates.]\n\n## Key Talking Points (Quick Reference)\n\n[Insert value, moat, integration, objections, and the ask.]\n\n---\n\n_Practice this script twice before your Anthropic meeting. Use as-is for board/investor pitches._`;

export default function CustomerPitchScript() {
  return (
    <div
      style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: 24 }}
    >
      <h1>Pitch Script: Customer Workflows</h1>
      <pre>{content}</pre>
    </div>
  );
}
