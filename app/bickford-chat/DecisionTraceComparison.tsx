"use client";
import React, { useState } from "react";
import TraceViewer from "./trace-viewer";

// Types for the ledger entry (replace with real types if available)
type LedgerEntry = {
  id: string;
  timestamp: string;
  userInput: string;
  policyDecision: string;
  modelSelected: string;
  ledgerHash: string;
  merkleProof?: string;
  reconstruction?: string;
  [key: string]: any;
};

interface DecisionTraceComparisonProps {
  entries: LedgerEntry[];
}

const DecisionTraceComparison: React.FC<DecisionTraceComparisonProps> = ({
  entries,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<LedgerEntry | null>(null);
  const [selectedRight, setSelectedRight] = useState<LedgerEntry | null>(null);

  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        justifyContent: "center",
        margin: "2rem auto",
        maxWidth: 1200,
      }}
    >
      {/* Left Trace Selector */}
      <div style={{ flex: 1 }}>
        <h3>Trace A</h3>
        <select
          style={{ width: "100%", marginBottom: 12 }}
          onChange={(e) =>
            setSelectedLeft(
              entries.find((entry) => entry.id === e.target.value) || null,
            )
          }
          value={selectedLeft?.id || ""}
        >
          <option value="">Select a trace...</option>
          {entries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {new Date(entry.timestamp).toLocaleString()} -{" "}
              {entry.policyDecision}
            </option>
          ))}
        </select>
        {selectedLeft && (
          <TraceViewer
            entry={selectedLeft}
            onClose={() => setSelectedLeft(null)}
          />
        )}
      </div>
      {/* Right Trace Selector */}
      <div style={{ flex: 1 }}>
        <h3>Trace B</h3>
        <select
          style={{ width: "100%", marginBottom: 12 }}
          onChange={(e) =>
            setSelectedRight(
              entries.find((entry) => entry.id === e.target.value) || null,
            )
          }
          value={selectedRight?.id || ""}
        >
          <option value="">Select a trace...</option>
          {entries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {new Date(entry.timestamp).toLocaleString()} -{" "}
              {entry.policyDecision}
            </option>
          ))}
        </select>
        {selectedRight && (
          <TraceViewer
            entry={selectedRight}
            onClose={() => setSelectedRight(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DecisionTraceComparison;
