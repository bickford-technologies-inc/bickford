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
            outline: focusedModuleIdx === idx ? "2px solid #f59e0b" : undefined,
            zIndex: focusedModuleIdx === idx ? 2 : 1,
          }}
        >
          <div className={`module-icon ${mod.icon}`}></div>
          <div className="module-info">
            <h3>{mod.title}</h3>
            <p>{mod.description}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              {mod.metrics.map((m, i) => (
                <span
                  key={i}
                  style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}
                >
                  {m.value}{" "}
                  <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                    {m.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
