import { useEffect, useState } from "react";

export type StreamEvent =
  | { type: "agent"; agent: string; token: string }
  | { type: "final"; data: any };

export function useAgentStream(input: string) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!input) return;

    setRunning(true);
    setEvents([]);

    const es = new EventSourcePolyfill("/api/converge-stream", {
      method: "POST",
      body: input,
    });

    (es as EventSource).addEventListener("agent", (e: MessageEvent) => {
      const d = JSON.parse(e.data);
      setEvents((ev) => [...ev, { type: "agent", ...d }]);
    });

    (es as EventSource).addEventListener("final", (e: MessageEvent) => {
      setEvents((ev) => [...ev, { type: "final", data: JSON.parse(e.data) }]);
      es.close();
      setRunning(false);
    });

    return () => es.close();
  }, [input]);

  return { events, running };
}

// Minimal polyfill for POST-based SSE
class EventSourcePolyfill {
  constructor(url: string, opts: any) {
    const controller = new AbortController();
    fetch(url, {
      method: opts.method,
      body: opts.body,
      signal: controller.signal,
    }).then(async (res) => {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value);
        parse(buf, opts);
      }
    });

    this.close = () => controller.abort();
  }
  close() {}
}

function parse(text: string, opts: any) {
  const events = text.split("\n\n");
  for (const e of events) {
    if (!e.includes("event:")) continue;
    const [, ev, data] = e.match(/event:\s(.+)\ndata:\s(.+)/s) || [];
    if (ev && data) {
      window.dispatchEvent(new MessageEvent(ev, { data }));
    }
  }
}
