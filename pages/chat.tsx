import React from "react";

export default function ChatPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7" }}>
      <h1 style={{ textAlign: "center", marginTop: 32 }}>
        Bickford Conversational Chat
      </h1>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
        <div
          style={{
            padding: 32,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <b>Chat box has been disabled for this demo.</b>
        </div>
      </div>
    </div>
  );
}
