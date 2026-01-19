"use client";

import { useEffect, useState } from "react";

export default function CanonDAG() {
  const [dag, setDag] = useState<any>(null);

  useEffect(() => {
    fetch("/canon-dag.json")
      .then((r) => r.json())
      .then(setDag);
  }, []);

  if (!dag) return <pre>Loading canon DAG…</pre>;

  return (
    <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(dag, null, 2)}</pre>
  );
}
