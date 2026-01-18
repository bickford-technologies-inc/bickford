"use client";

export function RefusalBanner({
  code,
  message
}: {
  code?: string;
  message?: string;
}) {
  if (!code && !message) return null;

  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        border: "2px solid #ff3333",
        background: "#1a0000",
        color: "#ffcccc",
        borderRadius: 6
      }}
    >
      <h3 style={{ margin: 0, color: "#ff5555" }}>
        ⛔ Execution Refused
      </h3>
      {code && (
        <div style={{ marginTop: 8 }}>
          <strong>Code:</strong>{" "}
          <code style={{ color: "#ffaaaa" }}>{code}</code>
        </div>
      )}
      {message && (
        <div style={{ marginTop: 8 }}>
          <strong>Reason:</strong> {message}
        </div>
      )}
    </div>
  );
}
