import React from "react";

export function ToastStack({ toasts, removeToast }) {
  return (
    <div
      className="toast-container"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t, idx) => (
        <div
          key={t.id}
          style={{
            animation: "toast-in 0.3s cubic-bezier(.4,0,.2,1)",
            pointerEvents: "auto",
          }}
        >
          <Toast
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
            id={t.id}
          />
        </div>
      ))}
    </div>
  );
}

function Toast({ message, type, onClose, id }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div
      className={`toast ${type}`}
      role="status"
      aria-live="polite"
      tabIndex={0}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 220,
        maxWidth: 340,
        marginBottom: 8,
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.12)",
        borderLeft:
          type === "success"
            ? "4px solid #22c55e"
            : type === "error"
              ? "4px solid #ef4444"
              : "4px solid #f59e0b",
      }}
    >
      <span className="toast-message" style={{ flex: 1 }}>
        {message}
      </span>
      <button
        aria-label="Dismiss notification"
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: 18,
          cursor: "pointer",
          marginLeft: 4,
        }}
      >
        ×
      </button>
    </div>
  );
}
