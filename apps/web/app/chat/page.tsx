import { appVoice } from "../uiCopy";
import { ChatGPTPanel } from "./ChatGPTPanel";
import { BickfordTracePanel } from "./BickfordTracePanel";

const projects = [
  "Launch readiness",
  "Ledger reconciliation",
  "Authority proofs",
  "Deployment gating",
];

export default function ChatComparisonPage() {
  // Example data
  const messages = [];
  const trace = {
    decision: "ALLOWED",
    policy: "prod-safety-v4.1",
    optrScore: 0.87,
    rootHash: "0x3a9f...",
  };
  const status = "RECONSTRUCTABLE";
  const missing = ["Arbitration", "Merkle Proof", "Policy Status"];

  return (
    <main className="chatComparisonShell">
      <header className="chatComparisonHeader">
        <h1>{appVoice.compare}</h1>
        <p>{appVoice.welcome}</p>
      </header>
      <section
        className="chatComparisonPanels"
        style={{ display: "flex", gap: 32 }}
      >
        <div style={{ flex: 1 }}>
          <ChatGPTPanel messages={messages} missing={missing} />
        </div>
        <div style={{ flex: 1 }}>
          <BickfordTracePanel trace={trace} status={status} />
        </div>
      </section>
      <footer style={{ marginTop: 32 }}>
        <input
          placeholder={appVoice.prompt}
          aria-label={appVoice.prompt}
          style={{ width: 400, marginRight: 8 }}
        />
        <button>{appVoice.button}</button>
      </footer>
    </main>
  );
}
