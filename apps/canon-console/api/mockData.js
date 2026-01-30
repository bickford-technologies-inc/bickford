// Mock API data for Canon Console development
export const modules = [
  {
    id: "canon-runtime",
    title: "Canon Runtime",
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
  // ...other modules (copy from main.js/moduleData)
];

export const auditLogs = [
  {
    id: "evt_001",
    timestamp: "2026-01-29 21:14:59",
    event: "Policy Enforcement",
    module: "Canon Runtime",
    hash: "a7c8f2e1...",
    status: "verified",
  },
  // ...other logs
];

export const alerts = [
  {
    id: "alert_001",
    type: "critical",
    title: "Policy Hash Mismatch Detected",
    message:
      "Healthcare module policy state differs from canonical hash. Execution blocked.",
    meta: "5 minutes ago • Healthcare Module • Production",
  },
  // ...other alerts
];

export const deployments = [
  {
    id: "deploy_001",
    module: "Healthcare",
    version: "v2.5.0",
    status: "deployed",
    meta: "2 hours ago • 38 instances • All regions",
  },
  // ...other deployments
];

export const verification = {
  total: 48293,
  successRate: "100%",
  avgResponse: "2.3ms",
  hashes: {
    canon_runtime: "sha256:a7c8f2e19b4d6a3c8f2e19b4d6a3c8f2e19b4d",
    healthcare: "sha256:b3d9e4a28c5f0a1b8d3e9c4a28c5f0a1b8d3e",
    defense: "sha256:d2e7c9f45a8b3c6d9e2f7c45a8b3c6d9e2f7",
    finance: "sha256:e8b3a5d19c7f2e4a8b3d5c19c7f2e4a8b3d5",
  },
};
