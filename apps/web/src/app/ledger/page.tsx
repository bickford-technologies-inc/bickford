"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const es = new EventSource("/api/history/stream");
    es.onmessage = (e) => setEvents((v) => [...v, e.data]);
    return () => es.close();
  }, []);

  return (
    <main style={{ padding: 48 }}>
      <h1>Live History</h1>
      <pre>{events.join("\n")}</pre>
    </main>
  );
}
