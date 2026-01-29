import React from "react";

const content = `Tamper Detection/Forensics Demo (Bickford)\n\nOriginal Proof Chain:\n  REQUEST: 0fbdc939a8b7d5f334921ab952683ad27494199f0d32a3f6311050687d72c513\n  ENFORCEMENT: 0d3ca103183ffddc8cd466afa6e1ad0772c7984858a6137a1b39ae84936397a5\n  RESPONSE: f22cee7317d9d5110c9bbdf0b674990ef390d25befeb9a4d361933fc2ae273e1\n  MERKLE_ROOT: 786c8e14e81726cc40e3dc60c92f002d6b1d0abba649fc4a2035485b181b276d\n\nTampered Proof Chain (response changed):\n  REQUEST: 0fbdc939a8b7d5f334921ab952683ad27494199f0d32a3f6311050687d72c513\n  ENFORCEMENT: 0d3ca103183ffddc8cd466afa6e1ad0772c7984858a6137a1b39ae84936397a5\n  RESPONSE: 6facb1fe00500c278d5fe85225fa4abac21a6353633829f98647514143418da5\n  MERKLE_ROOT: 185d29e20701ed0888e0ff56c31f4f02d86d8af7641d04282d8503ba25d0c5a0\n\nVerification:\n  Original Merkle Root:   786c8e14e81726cc40e3dc60c92f002d6b1d0abba649fc4a2035485b181b276d\n  Tampered Merkle Root:   185d29e20701ed0888e0ff56c31f4f02d86d8af7641d04282d8503ba25d0c5a0\n✅ Tampering detected (Merkle root mismatch)`;

export default function TamperDemo() {
  return (
    <div
      style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: 24 }}
    >
      <h1>Tamper Detection/Forensics Demo</h1>
      <pre>{content}</pre>
    </div>
  );
}
