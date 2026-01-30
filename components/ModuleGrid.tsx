import React from "react";

interface Metric {
  value: string;
  label: string;
}
interface Module {
  title: string;
  icon: string;
  status: string;
  description: string;
  metrics: Metric[];
  actions: string[];
}
interface ModuleGridProps {
  moduleData: Record<string, Module>;
  openModulePanel: (id: string) => void;
  setFocusedModuleIdx: (idx: number) => void;
  focusedModuleIdx: number;
}

export function ModuleGrid({
  moduleData,
  openModulePanel,
  setFocusedModuleIdx,
  focusedModuleIdx,
}: ModuleGridProps) {
  return (
    <div className="module-grid">
      {Object.entries(moduleData).map(([id, mod], idx) => (
        <div
          key={id}
          className="module-card"
          onClick={() => openModulePanel(id)}
          tabIndex={0}
          aria-label={`Open ${mod.title} details`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openModulePanel(id);
          }}
          onFocus={() => setFocusedModuleIdx(idx)}
          style={{
            outline: focusedModuleIdx === idx ? "2px solid #001F3F" : undefined,
            zIndex: focusedModuleIdx === idx ? 2 : 1,
          }}
        >
          <div className={`module-icon ${mod.icon}`}></div>
          <div className="module-info">
            <h3>{mod.title}</h3>
            <p>{mod.description}</p>
            <div
              className="module-metrics"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 10,
                alignItems: "flex-end",
                justifyContent: "flex-start",
              }}
            >
              {mod.metrics.map((m, i) => (
                <span
                  key={i}
                  className="module-metric"
                  style={{
                    fontSize: 13,
                    color: "#001F3F",
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    minWidth: 70,
                    maxWidth: 90,
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{m.value}</span>
                  <span style={{ color: "#9ca3af", fontWeight: 400 }}>{m.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
