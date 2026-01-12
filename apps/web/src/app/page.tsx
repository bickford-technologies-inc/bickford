/**
 * Bickford Homepage
 * Main landing page for the Bickford execution runtime
 */

export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Bickford</h1>
      <p style={{ fontSize: "1.5rem", color: "#666" }}>
        Intent → Reality in &lt;5 seconds
      </p>
      
      <section style={{ marginTop: "2rem" }}>
        <h2>What This Is</h2>
        <p>
          Bickford is an execution authority layer that accepts natural language
          intent and executes changes with:
        </p>
        <ul>
          <li><strong>OPTR Engine</strong> - Optimizes Time-to-Value</li>
          <li><strong>Canon Authority</strong> - SHA-256 gated execution</li>
          <li><strong>Ledger</strong> - Append-only Postgres log</li>
          <li><strong>Session Completion</strong> - &lt;5ms p99 latency</li>
        </ul>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>API Endpoints</h2>
        <ul>
          <li><code>POST /api/execute</code> - Execute an intent</li>
          <li><code>GET /api/ledger</code> - Query ledger</li>
          <li><code>GET /api/canon</code> - Canon status</li>
          <li><code>GET /api/health</code> - Health check</li>
        </ul>
      </section>

      <section style={{ marginTop: "2rem", padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
        <h3>Quick Test</h3>
        <p>Check system health:</p>
        <code style={{ display: "block", padding: "0.5rem", background: "white", borderRadius: "4px" }}>
          curl http://localhost:3000/api/health
        </code>
      </section>
    </main>
  );
}
