"use client";

import { useState } from "react";

export default function Page() {
  const [result, setResult] = useState<any>(null);

  async function execute() {
    const res = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", origin: "human" })
    });
    setResult(await res.json());
  }

  return (
    <>
      <h1>Bickford Execution</h1>
      <button onClick={execute}>Execute Intent</button>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </>
  );
}
