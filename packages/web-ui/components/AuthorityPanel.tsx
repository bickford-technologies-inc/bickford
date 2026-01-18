"use client";

type AuthorityArtifact = {
  status: "LOCKED" | "REFUSED";
  artifact?: {
    authorityAgentId: string;
    hash: string;
    executablePlan: any[];
  };
  refusalReason?: {
    code: string;
    message: string;
  };
};

export function AuthorityPanel({ result }: { result: AuthorityArtifact | null }) {
  if (!result) {
    return (
      <div style={{ padding: 16, border: "1px solid #333", marginTop: 24 }}>
        <strong>Authority:</strong> No execution yet
      </div>
    );
  }

  if (result.status === "LOCKED") {
    return (
      <div
        style={{
          padding: 16,
          border: "2px solid #00ff88",
          marginTop: 24,
          background: "#021"
        }}
      >
        <h3 style={{ color: "#00ff88" }}>🔒 EXECUTION LOCKED</h3>
        <div>Authority Agent: {result.artifact?.authorityAgentId}</div>
        <div>Artifact Hash:</div>
        <code>{result.artifact?.hash}</code>
        <pre style={{ marginTop: 12 }}>
          {JSON.stringify(result.artifact?.executablePlan, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        border: "2px solid #ff4444",
        marginTop: 24,
        background: "#210"
      }}
    >
      <h3 style={{ color: "#ff4444" }}>⛔ EXECUTION REFUSED</h3>
      <div>Code: {result.refusalReason?.code}</div>
      <div>{result.refusalReason?.message}</div>
    </div>
  );
}
