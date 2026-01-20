"use client";

import { useEffect, useState } from "react";
import styles from "./ChatDock.module.css";

export default function ChatDock() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
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
          <div className={styles.dock} onClick={(event) => event.stopPropagation()}>
            <input
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submit()}
              placeholder="What should we do next?"
            />
          </div>
        </div>
      )}
    </>
  );
}
