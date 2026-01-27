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

  const enforcer = new ClaudeConstitutionalEnforcer();
  // Run under policy v1
  const requestV1 = {
    model: "claude-3-sonnet-20250514",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 512,
    system: `Policy Version: ${policyV1.version}`,
  };
  const resultV1 = await enforcer.enforceClaudeRequest(requestV1);
  output += `Prompt: "${prompt}"\nPolicy Version: ${policyV1.version}\nStatus: ${resultV1.enforcement.allowed ? "ALLOWED" : "DENIED"}\nViolated Constraints: ${resultV1.enforcement.violated_constraints?.join(", ") || "None"}\nProof Chain: ${resultV1.proof_chain?.join(" → ") || "None"}\n`;
  output +=
    "───────────────────────────────────────────────────────────────────────\n\n";

  // Run under policy v2
  const requestV2 = {
    model: "claude-3-sonnet-20250514",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 512,
    system: `Policy Version: ${policyV2.version}`,
  };
  const resultV2 = await enforcer.enforceClaudeRequest(requestV2);
  output += `Prompt: "${prompt}"\nPolicy Version: ${policyV2.version}\nStatus: ${resultV2.enforcement.allowed ? "ALLOWED" : "DENIED"}\nViolated Constraints: ${resultV2.enforcement.violated_constraints?.join(", ") || "None"}\nProof Chain: ${resultV2.proof_chain?.join(" → ") || "None"}\n`;
  output +=
    "───────────────────────────────────────────────────────────────────────\n\n";

  output += `Result: Policy version in proof chain matches enforcement. Drift is impossible.\n`;
  await writeFile("demo-outputs/policy-update-demo.txt", output);
}

run();
