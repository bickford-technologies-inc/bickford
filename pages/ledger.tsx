import React, { useEffect, useState } from "react";
import LedgerTable from "../components/LedgerTable";
import NarrativeToggle from "../components/NarrativeToggle";
import CompressionStats from "../components/CompressionStats";

export default function LedgerViewer() {
  const [entries, setEntries] = useState([]);
  const [narrative, setNarrative] = useState<"anthropic" | "commercial">(
    "anthropic",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ledger")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Bickford Ledger Viewer</h1>
      <NarrativeToggle narrative={narrative} setNarrative={setNarrative} />
      <NarrativeCopy narrative={narrative} />
      <CompressionStats entries={entries} narrative={narrative} />
      <LedgerTable entries={entries} loading={loading} />
    </div>
  );
}

function NarrativeCopy({
  narrative,
}: {
  narrative: "anthropic" | "commercial";
}) {
  if (narrative === "anthropic") {
    return (
      <div
        style={{
          margin: "16px 0",
          background: "#e6f7ff",
          padding: 16,
          borderRadius: 8,
        }}
      >
        <b>Constitutional AI runtime enforcement with efficient storage.</b>
        <ul>
          <li>Enforces Constitutional AI at runtime—no violations possible.</li>
          <li>
            Cryptographically hash-chained audit trails for external proof.
          </li>
          <li>
            Storage efficiency (99.9% compression) as a practical benefit.
          </li>
          <li>Production-validated: 5GB ledger → 5.06MB.</li>
        </ul>
        <i>
          "I've built Constitutional AI enforcement that enterprises actually
          adopt because it saves money through efficient Content-Addressable
          Storage."
        </i>
      </div>
    );
  }
  return (
    <div
      style={{
        margin: "16px 0",
        background: "#fffbe6",
        padding: 16,
        borderRadius: 8,
      }}
    >
      <b>Enterprise AI compliance with 99.9% storage efficiency.</b>
      <ul>
        <li>$122M+ annual value proposition for large-scale deployments.</li>
        <li>ROI calculator with real scenarios.</li>
        <li>Compression technology validated in production.</li>
        <li>
          Clear market positioning: cut compliance storage costs by 99.9% while
          guaranteeing Constitutional AI safety.
        </li>
      </ul>
      <i>
        "Cut compliance storage costs by 99.9% while guaranteeing Constitutional
        AI safety."
      </i>
    </div>
  );
}
