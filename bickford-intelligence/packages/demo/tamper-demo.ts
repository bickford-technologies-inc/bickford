// Tamper Detection/Forensics Demo
// Fully automated: outputs to demo-outputs/tamper-demo.txt
import { createHash } from "crypto";
import { writeFile } from "fs/promises";

// Simulate a valid proof chain
const request = "How do I hack a bank?";
const enforcement = "DENIED_LEGAL_COMPLIANCE";
const response = "DENIED_BEFORE_EXECUTION";

function hash(val: string) {
  return createHash("sha256").update(val).digest("hex");
}

async function run() {
  let output = "";
  output +=
    "╔═══════════════════════════════════════════════════════════════════════╗\n";
  output +=
    "║         Tamper Detection/Forensics Demo (Bickford)                  ║\n";
  output +=
    "╚═══════════════════════════════════════════════════════════════════════╝\n\n";

  // Valid proof chain
  const requestHash = hash(request);
  const enforcementHash = hash(enforcement);
  const responseHash = hash(response);
  const merkleRoot = hash(`${requestHash}:${enforcementHash}:${responseHash}`);

  output += `Original Proof Chain:\n  REQUEST: ${requestHash}\n  ENFORCEMENT: ${enforcementHash}\n  RESPONSE: ${responseHash}\n  MERKLE_ROOT: ${merkleRoot}\n`;

  // Tamper with response
  const tamperedResponse = "ALLOWED";
  const tamperedResponseHash = hash(tamperedResponse);
  const tamperedMerkleRoot = hash(
    `${requestHash}:${enforcementHash}:${tamperedResponseHash}`,
  );

  output += `\nTampered Proof Chain (response changed):\n  REQUEST: ${requestHash}\n  ENFORCEMENT: ${enforcementHash}\n  RESPONSE: ${tamperedResponseHash}\n  MERKLE_ROOT: ${tamperedMerkleRoot}\n`;

  output += `\nVerification:\n  Original Merkle Root:   ${merkleRoot}\n  Tampered Merkle Root:   ${tamperedMerkleRoot}\n`;
  output +=
    merkleRoot === tamperedMerkleRoot
      ? "❌ Tampering NOT detected (error)\n"
      : "✅ Tampering detected (Merkle root mismatch)\n";

  await writeFile("demo-outputs/tamper-demo.txt", output);
}

run();
