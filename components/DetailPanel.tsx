import React from "react";

export function DetailPanel({
  detailPanel,
  moduleData,
  editingDescription,
  editedDescription,
  setEditedDescription,
  startEditDescription,
  saveDescription,
  cancelEditDescription,
  handleModuleAction,
  closeDetailPanel,
}) {
  if (!detailPanel) return null;
  return (
    <div
      className="detail-panel active"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") closeDetailPanel();
        // Trap focus inside panel
        if (e.key === "Tab") {
          const focusable = Array.from(
            document.querySelectorAll(
              ".detail-panel.active button, .detail-panel.active textarea",
            ),
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
      <div className="detail-panel-header">
        <div className="detail-panel-title">
          <div className={`module-icon ${moduleData[detailPanel].icon}`}></div>
          <h2>{moduleData[detailPanel].title}</h2>
        </div>
        <button className="detail-panel-close" onClick={closeDetailPanel}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="18"
            height="18"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="detail-panel-content">
        <div className="detail-section">
          <h3>Status</h3>
          <span className={`status-badge ${moduleData[detailPanel].status}`}>
            {moduleData[detailPanel].status === "active"
              ? "Active"
              : moduleData[detailPanel].status === "warning"
                ? "Warning"
                : "Inactive"}
          </span>
        </div>
        <div className="detail-section">
          <h3>Description</h3>
          {editingDescription ? (
            <>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                style={{ width: "100%", minHeight: 60, marginBottom: 8 }}
              />
              <button className="action-btn" onClick={saveDescription}>
                Save
              </button>
              <button
                className="action-btn"
                onClick={cancelEditDescription}
                style={{ marginLeft: 8 }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <p>{moduleData[detailPanel].description}</p>
              <button
                className="action-btn"
                onClick={startEditDescription}
                style={{ marginTop: 8 }}
              >
                Edit Description
              </button>
            </>
          )}
        </div>
        <div className="detail-section">
          <h3>Metrics</h3>
          <div className="metric-grid">
            {moduleData[detailPanel].metrics.map((m, i) => (
              <div className="metric-card" key={i}>
                <div className="metric-value">{m.value}</div>
                <div className="metric-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="detail-section">
          <h3>Actions</h3>
          <div className="action-list">
            {moduleData[detailPanel].actions.map((action, i) => (
              <button
                className="action-btn"
                key={i}
                onClick={() => handleModuleAction(action, detailPanel)}
                aria-label={action}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
