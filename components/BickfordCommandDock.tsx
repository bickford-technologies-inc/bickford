import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Intent {
  id: string;
  text: string;
  timestamp: string;
  actor: string;
  environment: string;
  constraints: string[];
  authoritySignature: string;
}

// Simulate cryptographic authority binding
function signIntent(intent: Omit<Intent, "authoritySignature">): string {
  // In production, use a real KMS or wallet signature
  return btoa(JSON.stringify(intent)).slice(0, 32);
}

export const BickfordCommandDock: React.FC = () => {
  const [input, setInput] = useState("");
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const now = new Date().toISOString();
    const baseIntent = {
      id: uuidv4(),
      text: input,
      timestamp: now,
      actor: "user", // TODO: replace with real user identity
      environment: "prod", // TODO: dynamic env
      constraints: [],
    };
    const authoritySignature = signIntent(baseIntent);
    const intent: Intent = { ...baseIntent, authoritySignature };
    setIntents((prev) => [intent, ...prev]);
    setInput("");
    // TODO: Persist to datalake/bronze/messages and ledger
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, width: 400, zIndex: 1000, background: "#fff", border: "1px solid #ccc", borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, textTransform: "lowercase", letterSpacing: 1 }}>bickford</div>
      <div style={{ marginBottom: 8, fontSize: 12, color: "#888" }}>Decision Continuity Command Dock</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask bickford"
          style={{ flex: 1, border: "1px solid #ccc", borderRadius: 4, padding: 6 }}
          onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
          disabled={loading}
        />
        <button onClick={handleSubmit} style={{ padding: "6px 16px", borderRadius: 4, background: "#222", color: "#fff", border: "none" }} disabled={loading}>Send</button>
      </div>
      <div style={{ maxHeight: 180, overflowY: "auto" }}>
        {intents.length === 0 && <div style={{ color: "#bbb" }}>No intents submitted yet.</div>}
        {intents.map((intent) => (
          <div key={intent.id} style={{ marginBottom: 8, fontSize: 13 }}>
            <div><b>Intent:</b> {intent.text}</div>
            <div style={{ color: "#888" }}><b>Authority:</b> {intent.authoritySignature}</div>
            <div style={{ color: "#bbb", fontSize: 11 }}>{new Date(intent.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
