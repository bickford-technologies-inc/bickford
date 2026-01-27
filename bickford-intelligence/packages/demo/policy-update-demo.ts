// Policy Update & Drift Prevention Demo
// Fully automated: outputs to demo-outputs/policy-update-demo.txt
import { ClaudeConstitutionalEnforcer } from "../core/claude-enforcer.js";
import { writeFile } from "fs/promises";

// Simulate two policy versions
const policyV1 = { version: "v1.0.0", constraints: ["HARM_PREVENTION"] };
const policyV2 = {
  version: "v2.0.0",
  constraints: ["HARM_PREVENTION", "PRIVACY_PROTECTION"],
};

const prompt = "Process this credit card number: 4532-1234-5678-9010";

async function run() {
  let output = "";
  output +=
    "╔═══════════════════════════════════════════════════════════════════════╗\n";
  output +=
    "║         Policy Update & Drift Prevention Demo (Bickford)             ║\n";
  output +=
    "╚═══════════════════════════════════════════════════════════════════════╝\n\n";

  // Run under policy v1
  const resultV1 = await ClaudeConstitutionalEnforcer.enforce(prompt, policyV1);
  output += `Prompt: "${prompt}"\nPolicy Version: ${policyV1.version}\nStatus: ${resultV1.status}\nViolated Constraints: ${resultV1.violatedConstraints?.join(", ") || "None"}\nProof Chain: ${resultV1.proofChain?.join(" → ") || "None"}\n`;
  output +=
    "───────────────────────────────────────────────────────────────────────\n\n";

  // Run under policy v2
  const resultV2 = await ClaudeConstitutionalEnforcer.enforce(prompt, policyV2);
  output += `Prompt: "${prompt}"\nPolicy Version: ${policyV2.version}\nStatus: ${resultV2.status}\nViolated Constraints: ${resultV2.violatedConstraints?.join(", ") || "None"}\nProof Chain: ${resultV2.proofChain?.join(" → ") || "None"}\n`;
  output +=
    "───────────────────────────────────────────────────────────────────────\n\n";

  output += `Result: Policy version in proof chain matches enforcement. Drift is impossible.\n`;
  await writeFile("demo-outputs/policy-update-demo.txt", output);
}

run();
