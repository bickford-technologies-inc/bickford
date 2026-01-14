"use client";

import { useState } from "react";

export default function OPTRPage() {
  const [pathMs, setPathMs] = useState(1000);
  const [score, setScore] = useState<number | null>(null);

  async function getScore() {
    const res = await fetch("/api/optr/score", {
      method: "POST",
      body: JSON.stringify({ pathMs }),
    });
    const data = await res.json();
    setScore(data.score);
  }

  return (
    <main style={{ padding: 48 }}>
      <h1>OPTR Scoring</h1>
      <div style={{ marginBottom: 16 }}>
        <label>
          Path time (ms):
          <input
            type="number"
            value={pathMs}
            onChange={(e) => setPathMs(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          />
        </label>
        <button onClick={getScore} style={{ marginLeft: 8 }}>
          Score
        </button>
      </div>
      {score !== null && <div>Score: {score}</div>}
    </main>
  );
}
