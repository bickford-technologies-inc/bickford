import React from "react";
import DecisionTraceViewer from "./DecisionTraceViewer";

// Placeholder: get sessionId from context, router, or props
const sessionId = "demo-session-1";

export default function BickfordChatPage() {
  return (
    <div>
      <h1>Bickford Chat</h1>
      {/* ...existing chat UI would go here... */}
      <DecisionTraceViewer sessionId={sessionId} />
    </div>
  );
}
