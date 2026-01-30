import React from "react";

export function LogsModal({ logsModal, moduleData, closeLogsModal }) {
  if (!logsModal) return null;
  return (
    <div
      className="modal-overlay"
      onClick={closeLogsModal}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") closeLogsModal();
        if (e.key === "Tab") {
          const focusable = Array.from(
            document.querySelectorAll(".modal button"),
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        }
      }}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Logs for {moduleData[logsModal].title}</h2>
          <button className="modal-close" onClick={closeLogsModal}>
            ×
          </button>
        </div>
        <div className="modal-content">
          <pre
            style={{
              background: "#222",
              color: "#f59e0b",
              padding: 16,
              borderRadius: 8,
            }}
          >
            [2026-01-30 12:00:00] INFO: Module started\n[2026-01-30 12:01:00] INFO: Operation completed\n[2026-01-30 12:02:00] WARN: No issues detected\n[2026-01-30 12:03:00] INFO: All systems nominal
          </pre>
        </div>
      </div>
    </div>
  );
}
