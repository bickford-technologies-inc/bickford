import React, { useState } from "react";

// Types for the ledger entry and merkle proof (replace with real types if available)
type LedgerEntry = {
  id: string;
  timestamp: string;
  userInput: string;
  policyDecision: string;
  modelSelected: string;
  ledgerHash: string;
  merkleProof?: string; // JSON or stringified proof
  reconstruction?: string; // JSON or stringified data
  [key: string]: any;
};

// Props: entry to display, and close handler
interface TraceViewerProps {
  entry: LedgerEntry;
  onClose: () => void;
}

const TraceViewer: React.FC<TraceViewerProps> = ({ entry, onClose }) => {
  const [showProof, setShowProof] = useState(false);
  const [showReconstruction, setShowReconstruction] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 32,
          minWidth: 400,
          maxWidth: 600,
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        }}
      >
        <h2>Decision Trace</h2>
        <div>
          <b>Time:</b> {new Date(entry.timestamp).toLocaleString()}
        </div>
        <div>
          <b>User Input:</b> {entry.userInput}
        </div>
        <div>
          <b>Policy Decision:</b> {entry.policyDecision}
        </div>
        <div>
          <b>Model Selected:</b> {entry.modelSelected}
        </div>
        <div>
          <b>Ledger Hash:</b>{" "}
          <span style={{ fontFamily: "monospace", fontSize: 13 }}>
            {entry.ledgerHash}
          </span>
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setShowProof((p) => !p)}
            style={{ marginRight: 8 }}
          >
            {showProof ? "Hide" : "Show"} Merkle Proof
          </button>
          <button onClick={() => setShowReconstruction((r) => !r)}>
            {showReconstruction ? "Hide" : "Show"} Reconstruction
          </button>
        </div>
        {showProof && (
          <pre
            style={{
              background: "#f6f8fa",
              padding: 12,
              borderRadius: 4,
              marginTop: 12,
              maxHeight: 200,
              overflow: "auto",
            }}
          >
            {entry.merkleProof || "No Merkle proof available."}
          </pre>
        )}
        {showReconstruction && (
          <pre
            style={{
              background: "#f6f8fa",
              padding: 12,
              borderRadius: 4,
              marginTop: 12,
              maxHeight: 200,
              overflow: "auto",
            }}
          >
            {entry.reconstruction || "No reconstruction data."}
          </pre>
        )}
        <div style={{ marginTop: 24, textAlign: "right" }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TraceViewer;
