"use client";

import { useEffect, useState } from "react";

export default function CanonDAG() {
  const [dag, setDag] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/canon-dag.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setDag)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <pre>Error loading canon DAG: {error}</pre>;
  if (!dag) return <pre>Loading canon DAG…</pre>;

  return (
    <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(dag, null, 2)}</pre>
  );
}
