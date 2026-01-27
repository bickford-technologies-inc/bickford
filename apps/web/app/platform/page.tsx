import dynamic from "next/dynamic";

// Dynamically import platform panels from bickford-ui
const ExecutionEnvelopePanel = dynamic(
  () =>
    import("@bickford/bickford-ui/panels/ExecutionEnvelopePanel").then(
      (m) => m.ExecutionEnvelopePanel,
    ),
  { ssr: false },
);
const SlowdownReasonPanel = dynamic(
  () =>
    import("@bickford/bickford-ui/panels/SlowdownReasonPanel").then(
      (m) => m.SlowdownReasonPanel,
    ),
  { ssr: false },
);

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
      <section style={{ marginBottom: 32 }}>
        <h2>Execution Envelope Panel</h2>
        <ExecutionEnvelopePanel envelope={exampleEnvelope} />
      </section>
      <section>
        <h2>Slowdown Reason Panel</h2>
        <SlowdownReasonPanel envelope={exampleEnvelope} />
      </section>
    </main>
  );
}
