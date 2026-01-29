import React from "react";

export default function LedgerTable({
  entries,
  loading,
}: {
  entries: any[];
  loading: boolean;
}) {
  if (loading) return <div>Loading ledger...</div>;
  if (!entries.length) return <div>No ledger entries found.</div>;

  return (
    <div style={{ overflowX: "auto", marginTop: 24 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Timestamp</th>
            <th style={th}>Event Type</th>
            <th style={th}>Success</th>
            <th style={th}>Payload</th>
            <th style={th}>Metadata</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={i} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
              <td style={td}>{entry.timestamp || "-"}</td>
              <td style={td}>{entry.eventType || "-"}</td>
              <td style={td}>
                {entry.payload?.success === true
                  ? "✅"
                  : entry.payload?.success === false
                    ? "❌"
                    : "-"}
              </td>
              <td style={td}>
                <pre style={{ margin: 0, fontSize: 12 }}>
                  {JSON.stringify(entry.payload, null, 2)}
                </pre>
              </td>
              <td style={td}>
                <pre style={{ margin: 0, fontSize: 12 }}>
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  borderBottom: "2px solid #eee",
  textAlign: "left",
  padding: 8,
};
const td: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  textAlign: "left",
  padding: 8,
  verticalAlign: "top",
};
