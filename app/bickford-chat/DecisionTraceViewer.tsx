"use client";
import React, { useEffect, useState } from "react";
import TraceViewer from "./trace-viewer";
import { appVoice } from "../uiCopy";

// Placeholder type for a ledger entry. Replace with actual type if available.
type LedgerEntry = {
  id: string;
  timestamp: string;
  userInput: string;
  policyDecision: string;
  modelSelected: string;
  ledgerHash: string;
  [key: string]: any;
};

// Fetch ledger entries for a session (stub: replace with real API call)
async function fetchLedgerEntries(sessionId: string): Promise<LedgerEntry[]> {
  // TODO: Replace with actual API endpoint
  const res = await fetch(`/api/ledger?sessionId=${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch ledger");
  return res.json();
}

export const DecisionTraceViewer: React.FC<{ sessionId: string }> = ({
  sessionId,
}) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchLedgerEntries(sessionId)
      .then(setEntries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div>{appVoice.loading}</div>;
  if (error) return <div>{appVoice.error}</div>;
  if (!entries.length)
    return <div>{appVoice.emptyState}</div>;

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "2rem auto",
        padding: 16,
        background: "#f9f9f9",
        borderRadius: 8,
      }}
    >
      <h2>Decision Trace Viewer</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>User Input</th>
            <th>Policy</th>
            <th>Model</th>
            <th>Ledger Hash</th>
            <th>Trace</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>{new Date(entry.timestamp).toLocaleTimeString()}</td>
              <td>{entry.userInput}</td>
              <td>{entry.policyDecision}</td>
              <td>{entry.modelSelected}</td>
              <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                {entry.ledgerHash}
              </td>
              <td>
                <button onClick={() => setSelectedEntry(entry)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedEntry && (
        <TraceViewer
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};

export default DecisionTraceViewer;
