import Link from "next/link";

export default function DataRoomPage() {
  return (
    <main style={{ padding: 56, maxWidth: 900 }}>
      <h1>Bickford — Anthropic Data Room</h1>

      <p>
        Bickford is a <strong>Decision Continuity Runtime</strong> that converts
        safe reasoning into deterministic execution and permanent institutional
        memory.
      </p>

      <h2>What This Demonstrates</h2>
      <ul>
        <li>Live Claude reasoning (advisory only)</li>
        <li>Structural memory (history)</li>
        <li>Rule promotion under ΔTTV + non-interference</li>
        <li>Mathematical compounding (no drift)</li>
      </ul>

      <h2>Live Proof</h2>
      <ul>
        <li>
          <Link href="/chat">Claude → Bickford Chat</Link>
        </li>
        <li>
          <Link href="/history">Append-Only History</Link>
        </li>
        <li>
          <Link href="/rules">Rules (Immutable)</Link>
        </li>
        <li>
          <Link href="/score">Path Scoring</Link>
        </li>
      </ul>

      <h2>Export</h2>
      <p>
        All rules, history entries, and enforcement proofs can be exported as a
        diligence bundle.
      </p>

      <a href="/api/export" target="_blank">
        <button style={{ padding: 12, fontSize: 16 }}>
          Download Acquisition Data Room Export
        </button>
      </a>
      <ul>
        <li>
          <Link href="/data-room/diff">Canon Diff Viewer</Link>
        </li>
        <li>
          <Link href="/data-room/proofs">Safety Proofs</Link>
        </li>
        <li>
          <a href="/api/export/zip">Download ZIP Export</a>
        </li>
        <li>
          <a href="/api/export/pdf">Download Board-Ready PDF</a>
        </li>
      </ul>
      <a href="/api/export/zip">
        <button>Download ZIP Data Room</button>
      </a>

      <hr style={{ margin: "48px 0" }} />

      <p style={{ fontStyle: "italic" }}>
        This is why the moat compounds rather than erodes.
      </p>
    </main>
  );
}
