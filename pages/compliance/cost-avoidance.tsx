import React from "react";

const costSummary = `💰 COST AVOIDANCE SUMMARY\n\nSOC-2 Type II Annual Savings: $188,000\nISO 27001 Annual Savings: $135,000\n\nTotal Annual Cost Avoidance: $323,000\n\n3-Year Value: $969,000\n\nPer Enterprise Customer: $646/year\n(Assuming 500 enterprise customers)`;

export default function CostAvoidancePage() {
  return (
    <div
      style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: 24 }}
    >
      <h1>Cost Avoidance Summary</h1>
      <pre>{costSummary}</pre>
    </div>
  );
}
