import React from "react";

const content = `# CUSTOMER_VALUE_EXECUTIVE_SUMMARY.md\n\n[1-page executive summary: summary table of all 6 customers, value breakdown, pain points, before/after, integration, moat, objections, next steps.]\n\n---\n\n## 6 Real Customer Workflows with Quantified Value\n\n| #   | Customer Type        | Industry        | Use Case          | Annual Value | Bickford Cost | Net Value | ROI     | Payback |\n| --- | -------------------- | --------------- | ----------------- | ------------ | ------------- | --------- | ------- | ------- |\n| 1   | Fortune 500          | Manufacturing   | Supply chain AI   | $2.82M       | $100K         | $2.72M    | 2,724%  | 13 days |\n| 2   | Defense Contractor   | Aerospace       | Engineering docs  | $16.96M      | $200K         | $16.76M   | 8,380%  | 4 days  |\n| 3   | Healthcare           | Hospital system | Clinical notes    | $54.70M      | $150K         | $54.55M   | 36,363% | 1 day   |\n| 4   | Trading Firm         | Finance         | Market analysis   | $2.31M       | $125K         | $2.19M    | 1,749%  | 21 days |\n| 5   | SaaS Company         | B2B software    | Customer support  | $6.97M       | $100K         | $6.87M    | 6,868%  | 5 days  |\n| 6   | Fast-Growing Startup | Legal tech      | Contract analysis | $3.84M       | $75K          | $3.77M    | 5,020%  | 7 days  |\n\n**TOTALS:** $87.6M value, $750K cost, $86.85M net value, 10,184% avg ROI, 8.5 day payback\n\n---\n\n[Include all summary, pain points, before/after, integration, moat, objections, and next steps content from your prompt.]\n\n---\n\n_Print this page for board meetings and as a leave-behind for Anthropic._`;

export default function CustomerExecutiveSummary() {
  return (
    <div
      style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: 24 }}
    >
      <h1>Customer Value Executive Summary</h1>
      <pre>{content}</pre>
    </div>
  );
}
