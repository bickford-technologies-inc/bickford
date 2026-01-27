"use client";
import React, { useEffect, useState } from "react";
import DecisionTraceViewer from "./DecisionTraceViewer";
import DecisionTraceComparison from "./DecisionTraceComparison";
import { appVoice } from "../uiCopy";

// Placeholder: get sessionId from context, router, or props
const sessionId = "demo-session-1";

export default function BickfordChatPage() {
  const [entries, setEntries] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/ledger?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  return (
    <div>
      <h1>{appVoice.welcome}</h1>
      {/* ...existing chat UI would go here... */}
      <DecisionTraceViewer sessionId={sessionId} />
      <h2 style={{ marginTop: 40 }}>Decision Trace Comparison</h2>
      <DecisionTraceComparison entries={entries} />
    </div>
  );
}
