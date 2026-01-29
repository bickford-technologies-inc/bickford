import React from "react";

const keyBenefits = `Key Benefits:\n  1. 48-74% of controls automated (vs 5-25% industry average)\n  2. Zero manual compliance reviews required\n  3. Audit-ready artifacts generated in real-time\n  4. Regulator-verifiable cryptographic proofs\n  5. Multi-framework support (SOC-2, ISO, FedRAMP, HIPAA, PCI DSS)`;

export default function KeyBenefitsPage() {
  return (
    <div
      style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: 24 }}
    >
      <h1>Key Benefits</h1>
      <pre>{keyBenefits}</pre>
    </div>
  );
}
