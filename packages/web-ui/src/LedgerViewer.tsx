"use client";

type LedgerEntry = {
  status: "LOCKED" | "REFUSED";
  artifact?: any;
  refusalReason?: { code: string; message: string };
  ts: number;
};

export function LedgerViewer({ entries }: { entries: LedgerEntry[] }) {
  return (
    <div
      style={{
        marginTop: 24,
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        padding: 16,
        background: "#ffffff"
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Ledger</h2>

      {entries.length === 0 && (
        <div style={{ color: "#6b7280" }}>No ledger entries yet.</div>
      )}

      {entries.map((e, i) => (
        <div
          key={i}
          style={{
            marginBottom: 14,
            padding: 12,
            borderRadius: 6,
            borderLeft:
              e.status === "LOCKED"
                ? "6px solid #16a34a"
                : "6px solid #dc2626",
            background:
              e.status === "LOCKED" ? "#f0fdf4" : "#fef2f2",
            border: "1px solid #e5e7eb"
          }}
        >
          <div style={{ fontWeight: 700 }}>
            {e.status === "LOCKED" ? "✅ LOCKED" : "❌ REFUSED"}
          </div>

          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            {new Date(e.ts).toISOString()}
          </div>

          {e.status === "LOCKED" && (
            <pre style={{ marginTop: 8 }}>
              {JSON.stringify(e.artifact, null, 2)}
            </pre>
          )}

          {e.status === "REFUSED" && (
            <div style={{ marginTop: 8 }}>
              <div>
                <strong>Code:</strong> {e.refusalReason?.code}
              </div>
              <div>
                <strong>Reason:</strong> {e.refusalReason?.message}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
