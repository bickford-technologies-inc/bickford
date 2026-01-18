"use client";

import { Thread } from "../lib/threadStore";

export function ThreadSidebar({
  threads,
  activeId,
  onSelect,
  onNew
}: {
  threads: Thread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <aside
      style={{
        width: 260,
        borderRight: "1px solid #222",
        padding: 12,
        background: "#0b0b0b",
        color: "eee"
      }}
    >
      <button
        onClick={onNew}
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 12,
          background: "#222",
          color: "#fff",
          border: "1px solid #333"
        }}
      >
        + New Thread
      </button>

      {threads.map(t => (
        <div
          key={t.id}
          onClick={() => onSelect(t.id)}
          style={{
            padding: 8,
            marginBottom: 6,
            cursor: "pointer",
            background: t.id === activeId ? "#222" : "transparent",
            border: "1px solid #333"
          }}
        >
          {t.title}
        </div>
      ))}
    </aside>
  );
}
