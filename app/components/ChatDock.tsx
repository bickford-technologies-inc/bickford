"use client";

import { useEffect, useState } from "react";
import styles from "./ChatDock.module.css";

export default function ChatDock() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function submit() {
    if (!value.trim()) return;

    await fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "COMMAND",
        content: value.trim(),
        source: "dock",
        timestamp: Date.now(),
      }),
    });

    setValue("");
    setOpen(false);
  }

  return (
    <>
      <button
        className={styles.fab}
        aria-label="Open Bickford"
        onClick={() => setOpen(true)}
      >
        bickford
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.dock} onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="What should we do next?"
            />
          </div>
        </div>
      )}
    </>
  );
}
