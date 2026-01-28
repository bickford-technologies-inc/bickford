import { PlatformPanels } from "./PlatformPanels.client";

// Example envelope data for demonstration
const exampleEnvelope = {
  mode: "SAFE",
  since: new Date().toISOString(),
  reason: "Rate limiting active due to policy enforcement.",
};

export default function PlatformPage() {
  return (
    <main style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
      <h1>Bickford Platform Screens</h1>
      <p>Demonstration of canonical Bickford platform panels and navigation.</p>
      <nav style={{ marginBottom: 24 }}>
        <a href="/chat" style={{ marginRight: 16 }}>
          Chat
        </a>
        <a href="/decision-trace-viewer" style={{ marginRight: 16 }}>
          Decision Trace Viewer
        </a>
        <a href="/canon-dag">Canon DAG</a>
      </nav>
      <PlatformPanels envelope={exampleEnvelope} />
    </main>
  );
}
