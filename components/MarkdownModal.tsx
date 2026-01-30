import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownModalProps {
  open: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

export function MarkdownModal({
  open,
  title,
  content,
  onClose,
}: MarkdownModalProps) {
  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        zIndex: 10010,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        className="modal markdown-modal"
        style={{
          background: "#23272f",
          color: "#fff",
          borderRadius: 10,
          maxWidth: 700,
          width: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 2px 16px #000a",
          padding: 32,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 22,
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <div style={{ marginTop: 18 }}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
