"use client";

import { useState } from "react";
import { AuthorityPanel } from "@/components/AuthorityPanel";

export default function Page() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);

  async function run() {
    const res = await fetch("/api/converge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: input
    });
    setResult(await res.json());
  }

  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>Bickford</h1>

      <textarea
        rows={14}
        style={{ width: "100%", marginTop: 16 }}
        placeholder="Paste execution input JSON here"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button onClick={run} style={{ marginTop: 12 }}>
        Execute
      </button>

      <AuthorityPanel result={result} />
    </main>
  );
}
