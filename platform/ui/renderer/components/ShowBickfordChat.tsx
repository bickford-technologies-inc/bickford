import React, { useState } from "react";
import { BickfordChat } from "./chat";

export default function ShowBickfordChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="bickford-chat-launcher"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999,
          background: "#23283a",
          color: "#7ecfff",
          border: "none",
          borderRadius: 24,
          padding: "12px 20px",
          fontWeight: 600,
          fontSize: 16,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {open ? "Close Bickford Chat" : "Open Bickford Chat"}
      </button>
      {open && <BickfordChat />}
    </>
  );
}
