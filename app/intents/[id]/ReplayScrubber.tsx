"use client";

import { useState } from "react";

export default function ReplayScrubber({ events }: { events: any[] }) {
  const [t, setT] = useState(events.length - 1);

  return (
    <div>
      <input
        type="range"
        min={0}
        max={events.length - 1}
        value={t}
        onChange={(event) => setT(Number(event.target.value))}
        style={{ width: "100%" }}
      />

      <pre
        style={{
          marginTop: 16,
          fontFamily: "var(--mono)",
          fontSize: 12.5,
          lineHeight: 1.6,
          background: "rgba(255,255,255,0.02)",
          padding: 16,
        }}
      >
        {JSON.stringify(events[t], null, 2)}
      </pre>
    </div>
  );
}
