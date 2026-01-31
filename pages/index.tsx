import React, { useState, useRef } from "react";
import Head from "next/head";
import { Sidebar } from "../components/Sidebar";
import { ModuleGrid } from "../components/ModuleGrid";
import { DetailPanel } from "../components/DetailPanel";
import { ToastStack } from "../components/ToastStack";
import { LogsModal } from "../components/LogsModal";
import { MarkdownModal } from "../components/MarkdownModal";
import { financialDocs } from "../financial/index";

const moduleData = {
  "canon-runtime": {
    title: "Canon Runtime",
    icon: "navy",
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
    icon: "navy",
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
    icon: "navy",
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
    icon: "navy",
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
    icon: "navy",
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
    icon: "navy",
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
    icon: "navy",
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
    icon: "navy",
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
  "data-lake-inn": {
    title: "Data Lake Inn",
    icon: "navy",
    status: "active",
    description:
      "Unified data lake for all governance, audit, and operational records. Integrates Bickford Chat for natural language data exploration, compliance queries, and instant insights across your entire AI stack.",
    metrics: [
      { value: "12PB", label: "Total Data" },
      { value: "1.2B", label: "Records" },
      { value: "99.999%", label: "Durability" },
      { value: "Bickford Chat", label: "AI Assistant" },
    ],
    actions: [
      "Open Bickford Chat",
      "Query Data Lake",
      "Export Dataset",
      "Configure Retention",
    ],
  },
  finance: {
    title: "Finance Module",
    icon: "navy",
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
  "financial-intelligence": {
    title: "Financial Intelligence",
    icon: "navy",
    status: "active",
    description:
      "Access all banker-grade financial, acquisition, and valuation documents. Instantly open, read, and analyze every strategic asset in the Bickford data room.",
    metrics: [
      { value: "11", label: "Documents" },
      { value: "100%", label: "Coverage" },
      { value: "Banker", label: "Grade" },
      { value: "Live", label: "Data Room" },
    ],
    actions: [
      "View Anthropic One Pager",
      "View Slide Deck",
      "View Pain Points Benchmark",
      "View Sale Positioning",
      "View Acquisition Memo",
      "View Enforcement Deck",
      "View Enforcement Infra",
      "View Valuation Defense",
      "View Acquisition Analysis",
      "View Strategic Proposal",
      "View Value Per Hour",
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

const navItems = [
  { label: "Dashboard", view: "dashboard", icon: "🏠" },
  { label: "Alerts", view: "alerts", icon: "🚨" },
  { label: "Audit Logs", view: "audit", icon: "📜" },
  { label: "Deployments", view: "deployments", icon: "🚀" },
];

const moduleNav = [
  { label: "Canon Runtime", id: "canon-runtime", icon: "🟡" },
  { label: "Policy Engine", id: "policy-engine", icon: "🟠" },
  { label: "Audit Ledger", id: "audit-ledger", icon: "🟡" },
  { label: "Verification", id: "verification", icon: "🔵" },
  { label: "Drift Detection", id: "drift-detection", icon: "🟡" },
  { label: "Alert System", id: "alert-system", icon: "🟠" },
];

const integrationNav = [
  { label: "Healthcare Module", id: "healthcare", icon: "🟡" },
  { label: "Defense Module", id: "defense", icon: "🔵" },
  { label: "Finance Module", id: "finance", icon: "🟡" },
];

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
              : "4px solid #001F3F",
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

export default function HomePage() {
  const [activeView, setActiveView] = useState("dashboard");
  const [detailPanel, setDetailPanel] = useState(null);
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [logsModal, setLogsModal] = useState(null);
  const [markdownModal, setMarkdownModal] = useState({
    open: false,
    title: "",
    content: "",
  });
  const moduleGridRef = useRef(null);
  const [focusedModuleIdx, setFocusedModuleIdx] = useState(-1);

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
    // Scroll to top and focus modal for accessibility
    setTimeout(() => {
      const modal = document.querySelector(
        ".documentation-modal, .coming-soon-modal",
      );
      if (modal) {
        modal.scrollIntoView({ behavior: "smooth", block: "center" });
        (modal as HTMLElement).focus();
      }
    }, 100);
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

  // Enhanced: handle module action execution
  async function handleModuleAction(action: string, moduleId: string) {
    if (moduleId === "financial-intelligence") {
      handleFinancialDocAction(action);
      return;
    }
    showToast(`Executing: ${action}...`, "info");
    if (action === "View Configuration") {
      showModal(
        "info",
        "Configuration",
        `Configuration for ${moduleData[moduleId].title} coming soon.`,
      );
    } else if (action === "Run Diagnostics") {
      await new Promise((r) => setTimeout(r, 1200));
      showToast(
        `Diagnostics complete for ${moduleData[moduleId].title}. No issues found.`,
        "success",
      );
    } else if (action === "Export Logs") {
      openLogsModal(moduleId);
    } else if (action === "Update Policy") {
      await new Promise((r) => setTimeout(r, 1000));
      showToast(`Policy updated for ${moduleData[moduleId].title}.`, "success");
    } else if (action === "Edit Policies") {
      showModal(
        "info",
        "Edit Policies",
        `Policy editor for ${moduleData[moduleId].title} coming soon.`,
      );
    } else if (action === "View Logs") {
      openLogsModal(moduleId);
    } else {
      showToast(`${action} - Coming soon!`, "info");
    }
  }

  async function handleFinancialDocAction(action: string) {
    const docMap = {
      "View Anthropic One Pager": "anthropic-constitutional-ai-one-pager",
      "View Slide Deck": "anthropic-constitutional-ai-slide-deck",
      "View Pain Points Benchmark": "anthropic-pain-points-benchmark",
      "View Sale Positioning": "anthropic-sale-positioning",
      "View Acquisition Memo": "banker-grade-acquisition-memo",
      "View Enforcement Deck": "constitutional-ai-enforcement-deck",
      "View Enforcement Infra": "constitutional-ai-enforcement-infra",
      "View Valuation Defense": "deal-valuation-defense",
      "View Acquisition Analysis": "optr-anthropic-acquisition-analysis",
      "View Strategic Proposal": "strategic-acquisition-proposal",
      "View Value Per Hour": "value-per-hour",
    };
    const docId = docMap[action];
    const doc = financialDocs.find((d) => d.id === docId);
    if (doc) {
      const res = await fetch(`/financial/${doc.file}`);
      const text = await res.text();
      setMarkdownModal({ open: true, title: doc.label, content: text });
    }
  }

  function startEditDescription() {
    setEditedDescription(moduleData[detailPanel].description);
    setEditingDescription(true);
  }
  function saveDescription() {
    // In a real app, this would persist to backend
    moduleData[detailPanel].description = editedDescription;
    setEditingDescription(false);
    showToast("Description updated!", "success");
  }
  function cancelEditDescription() {
    setEditingDescription(false);
  }
  function openLogsModal(moduleId) {
    setLogsModal(moduleId);
  }
  function closeLogsModal() {
    setLogsModal(null);
  }

  // Add refs for keyboard navigation
  const navRefs = useRef([]);
  const moduleNavRefs = useRef([]);
  const integrationNavRefs = useRef([]);

  // Keyboard navigation for sidebar
  function handleSidebarKeyDown(e, idx, section) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (section === "nav") {
        const next = (idx + 1) % navItems.length;
        navRefs.current[next]?.focus();
      } else if (section === "module") {
        const next = (idx + 1) % moduleNav.length;
        moduleNavRefs.current[next]?.focus();
      } else if (section === "integration") {
        const next = (idx + 1) % integrationNav.length;
        integrationNavRefs.current[next]?.focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (section === "nav") {
        const prev = (idx - 1 + navItems.length) % navItems.length;
        navRefs.current[prev]?.focus();
      } else if (section === "module") {
        const prev = (idx - 1 + moduleNav.length) % moduleNav.length;
        moduleNavRefs.current[prev]?.focus();
      } else if (section === "integration") {
        const prev = (idx - 1 + integrationNav.length) % integrationNav.length;
        integrationNavRefs.current[prev]?.focus();
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (section === "nav") {
        navigate(navItems[idx].view);
      } else if (section === "module") {
        openModulePanel(moduleNav[idx].id);
      } else if (section === "integration") {
        openModulePanel(integrationNav[idx].id);
      }
    }
  }

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

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
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin-bottom: 40px;
        }
        .module-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 28px 24px 24px 24px;
          display: flex;
          align-items: flex-start;
          gap: 20px;
          cursor: pointer;
          transition:
            box-shadow 0.25s,
            transform 0.18s,
            border-color 0.18s;
          box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
        }
        .module-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: #f59e0b;
          box-shadow: 0 6px 24px 0 rgba(245, 158, 11, 0.1);
          transform: translateY(-3px) scale(1.015);
        }
        .module-icon {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 2rem;
        }
        .module-icon.navy {
          background: linear-gradient(135deg, #001f3f 0%, #001f3f 100%);
        }
        .module-icon.slate {
          background: linear-gradient(135deg, #475569 0%, #64748b 100%);
        }
        .module-info h3 {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .module-info p {
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.5;
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
        <Sidebar
          navItems={navItems}
          moduleNav={moduleNav}
          integrationNav={integrationNav}
          activeView={activeView}
          navigate={navigate}
          openModulePanel={openModulePanel}
          navRefs={navRefs}
          moduleNavRefs={moduleNavRefs}
          integrationNavRefs={integrationNavRefs}
          handleSidebarKeyDown={handleSidebarKeyDown}
          showToast={showToast}
        />
        {/* Main Content */}
        <main className="main">
          {activeView === "dashboard" && (
            <>
              <h1 className="page-title">Canon Console</h1>
              <ModuleGrid
                moduleData={moduleData}
                openModulePanel={openModulePanel}
                setFocusedModuleIdx={setFocusedModuleIdx}
                focusedModuleIdx={focusedModuleIdx}
              />
            </>
          )}
          {/* Add other views here (alerts, audit, etc.) */}
        </main>
        {/* Detail Panel */}
        <DetailPanel
          detailPanel={detailPanel}
          moduleData={moduleData}
          editingDescription={editingDescription}
          editedDescription={editedDescription}
          setEditedDescription={setEditedDescription}
          startEditDescription={startEditDescription}
          saveDescription={saveDescription}
          cancelEditDescription={cancelEditDescription}
          handleModuleAction={handleModuleAction}
          closeDetailPanel={closeDetailPanel}
        />
        {/* Logs Modal */}
        <LogsModal
          logsModal={logsModal}
          moduleData={moduleData}
          closeLogsModal={closeLogsModal}
        />
      </div>
      {/* Toasts */}
      <ToastStack toasts={toasts} removeToast={removeToast} />
      <MarkdownModal
        open={markdownModal.open}
        title={markdownModal.title}
        content={markdownModal.content}
        onClose={() =>
          setMarkdownModal({ open: false, title: "", content: "" })
        }
      />
    </>
  );
}
