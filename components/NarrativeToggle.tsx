import React from "react";

export default function NarrativeToggle({
  narrative,
  setNarrative,
}: {
  narrative: "anthropic" | "commercial";
  setNarrative: (n: "anthropic" | "commercial") => void;
}) {
  return (
    <div style={{ margin: "16px 0" }}>
      <button
        onClick={() => setNarrative("anthropic")}
        style={{
          marginRight: 8,
          background: narrative === "anthropic" ? "#1890ff" : "#f0f0f0",
          color: narrative === "anthropic" ? "#fff" : "#000",
          border: "none",
          borderRadius: 4,
          padding: "8px 16px",
          cursor: "pointer",
        }}
      >
        Anthropic (AI Safety)
      </button>
      <button
        onClick={() => setNarrative("commercial")}
        style={{
          background: narrative === "commercial" ? "#faad14" : "#f0f0f0",
          color: narrative === "commercial" ? "#fff" : "#000",
          border: "none",
          borderRadius: 4,
          padding: "8px 16px",
          cursor: "pointer",
        }}
      >
        Commercial (Economic)
      </button>
    </div>
  );
}
