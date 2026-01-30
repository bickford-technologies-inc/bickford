import React, { useState, useRef } from "react";
import Head from "next/head";

const moduleData = {
  "canon-runtime": {
    title: "Canon Runtime",
    icon: "amber",
    status: "active",
    description:
      "The Canon Runtime is the core enforcement engine that provides deterministic governance guarantees. It ensures that every AI operation complies with declared policies through cryptographic verification.",
    metrics: [
      { value: "99.99%", label: "Uptime" },
      { value: "2.3ms", label: "Avg Latency" },
      { value: "1.2M", label: "Ops/Day" },
      { value: "0", label: "Violations" },
    ],
    actions: [
      "View Configuration",
      "Run Diagnostics",
      "Export Logs",
      "Update Policy",
    ],
  },
  "policy-engine": {
    title: "Policy Engine",
    icon: "orange",
    status: "active",
    description:
      "Converts Constitutional AI principles into mechanically enforceable runtime rules. Supports complex policy compositions and real-time policy updates without service interruption.",
    metrics: [
      { value: "847", label: "Active Policies" },
      { value: "12", label: "Policy Groups" },
      { value: "100%", label: "Coverage" },
      { value: "34", label: "Custom Rules" },
    ],
    actions: [
      "Edit Policies",
      "Test Rules",
      "Import Policy",
      "View Dependencies",
    ],
  },
  "audit-ledger": {
    title: "Audit Ledger",
    icon: "yellow",
    status: "active",
    description:
      "Cryptographic append-only ledger that maintains tamper-evident records of all governance decisions. Provides complete audit trail for regulatory compliance.",
    metrics: [
      { value: "2.4M", label: "Total Entries" },
      { value: "48K", label: "Today" },
      { value: "0", label: "Tamper Events" },
      { value: "∞", label: "Retention" },
    ],
    actions: [
      "Query Ledger",
      "Export Records",
      "Verify Chain",
      "Generate Report",
    ],
  },
  verification: {
    title: "Verification",
    icon: "slate",
    status: "active",
    description:
      "SHA-256 hash validation system that continuously verifies governance state integrity. Detects any drift from canonical policy configurations.",
    metrics: [
      { value: "48K", label: "Checks/Day" },
      { value: "100%", label: "Pass Rate" },
      { value: "<1ms", label: "Check Time" },
      { value: "0", label: "Drift Events" },
    ],
    actions: [
      "Run Verification",
      "View History",
      "Configure Alerts",
      "Export Hashes",
    ],
  },
  "drift-detection": {
    title: "Drift Detection",
    icon: "amber",
    status: "active",
    description:
      "Real-time monitoring system that detects any deviation from declared governance policies. Triggers immediate alerts and can auto-block non-compliant operations.",
    metrics: [
      { value: "0", label: "Active Drifts" },
      { value: "24/7", label: "Monitoring" },
      { value: "50ms", label: "Detection Time" },
      { value: "100%", label: "Coverage" },
    ],
    actions: [
      "View Dashboard",
      "Configure Thresholds",
      "Test Detection",
      "View History",
    ],
  },
  "alert-system": {
    title: "Alert System",
    icon: "orange",
    status: "active",
    description:
      "Instant notification system for governance violations. Supports multiple channels including Slack, PagerDuty, email, and webhooks.",
    metrics: [
      { value: "3", label: "Active Alerts" },
      { value: "5", label: "Channels" },
      { value: "<1s", label: "Delivery Time" },
      { value: "847", label: "This Month" },
    ],
    actions: [
      "View Alerts",
      "Configure Channels",
      "Set Thresholds",
      "Test Notifications",
    ],
  },
  healthcare: {
    title: "Healthcare Module",
    icon: "yellow",
    status: "active",
    description:
      "HIPAA-compliant governance module for clinical AI workflows. Ensures patient data protection, audit logging, and regulatory compliance for healthcare AI deployments.",
    metrics: [
      { value: "100%", label: "HIPAA Compliant" },
      { value: "12", label: "Hospitals" },
      { value: "847K", label: "Records/Day" },
      { value: "0", label: "PHI Violations" },
    ],
    actions: [
      "View Compliance",
      "Run HIPAA Check",
      "Export Audit",
      "Configure PHI Rules",
    ],
  },
  defense: {
    title: "Defense Module",
    icon: "slate",
    status: "active",
    description:
      "FedRAMP and ITAR compliant governance for defense and government AI deployments. Provides classified data handling and security clearance verification.",
    metrics: [
      { value: "High", label: "FedRAMP Level" },
      { value: "ITAR", label: "Certified" },
      { value: "3", label: "Agencies" },
      { value: "100%", label: "Cleared Ops" },
    ],
    actions: [
      "Security Review",
      "Access Control",
      "Export Logs",
      "Certification Status",
    ],
  },
  finance: {
    title: "Finance Module",
    icon: "amber",
    status: "warning",
    description:
      "SOX and SOC2 compliant governance for financial AI systems. Provides audit trails, access controls, and regulatory reporting for fintech deployments.",
    metrics: [
      { value: "SOC2", label: "Type II" },
      { value: "SOX", label: "Compliant" },
      { value: "8", label: "Banks" },
      { value: "1", label: "Pending" },
    ],
    actions: [
      "Compliance Dashboard",
      "Run SOX Check",
      "Generate Report",
      "View Audits",
    ],
  },
};

const searchableItems = [
  { name: "Canon Runtime", type: "module", id: "canon-runtime" },
  { name: "Policy Engine", type: "module", id: "policy-engine" },
  { name: "Audit Ledger", type: "module", id: "audit-ledger" },
  { name: "Verification", type: "module", id: "verification" },
  { name: "Drift Detection", type: "module", id: "drift-detection" },
  { name: "Alert System", type: "module", id: "alert-system" },
  { name: "Healthcare Module", type: "integration", id: "healthcare" },
  { name: "Defense Module", type: "integration", id: "defense" },
  { name: "Finance Module", type: "integration", id: "finance" },
  { name: "Dashboard", type: "view", id: "dashboard" },
  { name: "Alerts", type: "view", id: "alerts" },
  { name: "Audit Logs", type: "view", id: "audit" },
  { name: "Deployments", type: "view", id: "deployments" },
  { name: "HIPAA Compliance", type: "feature", id: "healthcare" },
  { name: "SOX Compliance", type: "feature", id: "finance" },
  { name: "FedRAMP", type: "feature", id: "defense" },
  { name: "SHA-256 Verification", type: "feature", id: "verification" },
];

function Toast({ message, type, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`toast ${type}`}>
      <span className="toast-message">{message}</span>
    </div>
  );
}

export default function CanonConsole() {
  const [activeView, setActiveView] = useState("dashboard");
  const [detailPanel, setDetailPanel] = useState(null);
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef(null);

  function showToast(message, type = "info") {
    setToasts((toasts) => [...toasts, { message, type, id: Math.random() }]);
  }
  function removeToast(id) {
    setToasts((toasts) => toasts.filter((t) => t.id !== id));
  }
  function navigate(viewId) {
    setActiveView(viewId);
    setDetailPanel(null);
  }
  function openModulePanel(moduleId) {
    setDetailPanel(moduleId);
  }
  function closeDetailPanel() {
    setDetailPanel(null);
  }
  function showModal(type, title, body) {
    setModal({ type, title, body });
  }
  function closeModal() {
    setModal(null);
  }
  const filteredSearch = search
    ? searchableItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      )
    : [];
  function selectSearchResult(type, id) {
    setSearch("");
    setSearchActive(false);
    if (type === "view") {
      navigate(id);
    } else {
      navigate("dashboard");
      setTimeout(() => openModulePanel(id), 100);
    }
  }
  React.useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        closeDetailPanel();
        closeModal();
      }
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Head>
        <title>Bickford - Canon Console</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </Head>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, sans-serif;
          background: linear-gradient(
            135deg,
            #1a1f2e 0%,
            #0d1117 50%,
            #1a2332 100%
          );
          min-height: 100vh;
          color: #fff;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: rgba(13, 17, 23, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 24px;
          font-weight: 600;
          color: #fff;
        }
        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-icon svg {
          width: 22px;
          height: 22px;
          fill: white;
        }
        .search-bar {
          flex: 1;
          max-width: 560px;
          margin: 0 40px;
        }
        .search-bar input {
          width: 100%;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          color: #9ca3af;
          font-size: 14px;
        }
        .search-bar input::placeholder {
          color: #6b7280;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .header-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }
        .btn-primary {
          background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
          color: white;
        }
        .btn-secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          background: #374151;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          position: relative;
        }
        .user-avatar::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid #0d1117;
        }
        .layout {
          display: flex;
          min-height: calc(100vh - 61px);
        }
        .sidebar {
          width: 200px;
          background: rgba(13, 17, 23, 0.8);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          padding: 16px 0;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          color: #9ca3af;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .nav-item.active {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          border-left: 3px solid #f59e0b;
        }
        .nav-item svg {
          width: 18px;
          height: 18px;
          opacity: 0.7;
        }
        .nav-section {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .nav-section-title {
          padding: 0 20px;
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
        }
        .user-section {
          position: absolute;
          bottom: 20px;
          left: 0;
          width: 200px;
          padding: 0 20px;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        .user-info-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }
        .user-info-text {
          font-size: 13px;
        }
        .user-info-role {
          font-size: 11px;
          color: #6b7280;
        }
        .main {
          flex: 1;
          padding: 32px 40px;
          position: relative;
          overflow: hidden;
        }
        .main::before {
          content: "";
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(
            circle,
            rgba(245, 158, 11, 0.1) 0%,
            transparent 70%
          );
          pointer-events: none;
        }
        .page-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 32px;
          color: #fff;
        }
        .module-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 1000px;
        }
        .module-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .module-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(245, 158, 11, 0.3);
          transform: translateY(-2px);
        }
        .module-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .module-icon svg {
          width: 26px;
          height: 26px;
        }
        .module-icon.amber {
          background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        }
        .module-icon.orange {
          background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
        }
        .module-icon.yellow {
          background: linear-gradient(135deg, #ca8a04 0%, #eab308 100%);
        }
        .module-icon.slate {
          background: linear-gradient(135deg, #475569 0%, #64748b 100%);
        }
        .module-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 6px;
        }
        .module-info p {
          font-size: 13px;
          color: #9ca3af;
          line-height: 1.4;
        }
        .hex-decoration {
          position: absolute;
          right: 40px;
          top: 80px;
          opacity: 0.15;
        }
        .hex {
          width: 60px;
          height: 52px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          clip-path: polygon(
            50% 0%,
            100% 25%,
            100% 75%,
            50% 100%,
            0% 75%,
            0% 25%
          );
        }
        .bottom-decoration {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 300px;
          height: 200px;
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(245, 158, 11, 0.05) 100%
          );
          clip-path: polygon(100% 0%, 100% 100%, 0% 100%);
        }
      `}</style>
      {/* Header */}
      <header className="header">
        <div className="logo" onClick={() => navigate("dashboard")}>
          {" "}
          {/* clickable */}
          <div className="logo-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <span>bickford</span>
        </div>
        <div className="search-bar">
          <input
            type="text"
            ref={searchInputRef}
            value={search}
            placeholder="Search modules..."
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchActive(true)}
            onBlur={() => setTimeout(() => setSearchActive(false), 200)}
          />
          <div
            className={`search-results${searchActive && search ? " active" : ""}`}
          >
            {filteredSearch.length === 0 ? (
              <div className="search-result-item">No results found</div>
            ) : (
              filteredSearch.map((item) => (
                <div
                  key={item.id}
                  className="search-result-item"
                  onMouseDown={() => selectSearchResult(item.type, item.id)}
                >
                  <strong>{item.name}</strong>
                  <span
                    style={{ color: "#6b7280", fontSize: 12, marginLeft: 8 }}
                  >
                    {item.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="header-actions">
          <button
            className="header-btn btn-primary"
            onClick={() => showToast("Documentation coming soon!", "info")}
          >
            Documentation
          </button>
          <button
            className="header-btn btn-secondary"
            onClick={() => showToast("Contact form coming soon!", "info")}
          >
            Contact Us
          </button>
          <div
            className="user-avatar"
            onClick={() => showToast("Profile settings coming soon!", "info")}
          >
            DB
          </div>
        </div>
      </header>
      {/* Layout */}
      <div className="layout">
        {/* Sidebar */}
        <nav className="sidebar">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`nav-item${activeView === item.view ? " active" : ""}`}
              onClick={() => navigate(item.view)}
              data-view={item.view}
            >
              {item.icon} {item.label}
            </div>
          ))}
          <div className="nav-section">
            <div className="nav-section-title">Modules</div>
            {moduleNav.map((item) => (
              <div
                key={item.id}
                className="nav-item"
                onClick={() => openModulePanel(item.id)}
              >
                {item.icon} {item.label}
              </div>
            ))}
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Integrations</div>
            {integrationNav.map((item) => (
              <div
                key={item.id}
                className="nav-item"
                onClick={() => openModulePanel(item.id)}
              >
                {item.icon} {item.label}
              </div>
            ))}
          </div>
          <div className="user-section">
            <div
              className="user-info"
              onClick={() => showToast("Profile settings coming soon!", "info")}
            >
              {" "}
              {/* clickable */}
              <div className="user-info-avatar">DB</div>
              <div>
                <div className="user-info-text">Derek Bickford</div>
                <div className="user-info-role">Administration</div>
              </div>
            </div>
          </div>
        </nav>
        {/* Main Content */}
        <main className="main">
          {activeView === "dashboard" && (
            <>
              <h1 className="page-title">Canon Console</h1>
              <div className="module-grid">
                {Object.entries(moduleData).map(([id, mod]) => (
                  <div
                    key={id}
                    className="module-card"
                    onClick={() => openModulePanel(id)}
                  >
                    <div className={`module-icon ${mod.icon}`}>
                      {/* You can add SVGs here as in your design */}
                    </div>
                    <div className="module-info">
                      <h3>{mod.title}</h3>
                      <p>{mod.description.split(".")[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* Add other views here (alerts, audit, etc.) */}
        </main>
        {/* Detail Panel */}
        {detailPanel && (
          <div className="detail-panel active">
            <div className="detail-panel-header">
              <div className="detail-panel-title">
                <div
                  className={`module-icon ${moduleData[detailPanel].icon}`}
                ></div>
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
                <span
                  className={`status-badge ${moduleData[detailPanel].status}`}
                >
                  {moduleData[detailPanel].status === "active"
                    ? "Active"
                    : moduleData[detailPanel].status === "warning"
                      ? "Warning"
                      : "Inactive"}
                </span>
              </div>
              <div className="detail-section">
                <h3>Description</h3>
                <p>{moduleData[detailPanel].description}</p>
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
                      onClick={() =>
                        showToast(`${action} - Coming soon!`, "info")
                      }
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
        )}
      </div>
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </>
  );
}
