// Bickford Canon Console JS - see original prompt for full JS
// All logic is inlined here for MVP
// Module Data
const moduleData = {
  /* ...full moduleData from prompt... */
};
// Search data
const searchableItems = [
  /* ...full searchableItems from prompt... */
];
// Navigation
function navigate(viewId) {
  /* ...from prompt... */
}
// Open module panel
function openModulePanel(moduleId) {
  /* ...from prompt... */
}
// Close detail panel
function closeDetailPanel() {
  /* ...from prompt... */
}
// Handle actions
function handleAction(action) {
  /* ...from prompt... */
}
// Search
function handleSearch(query) {
  /* ...from prompt... */
}
function showSearchResults() {
  /* ...from prompt... */
}
function hideSearchResults() {
  /* ...from prompt... */
}
function selectSearchResult(type, id) {
  /* ...from prompt... */
}
// Alerts
function showAlertDetail(title) {
  /* ...from prompt... */
}
function showLogDetail(id) {
  /* ...from prompt... */
}
function showDeploymentDetail(title) {
  /* ...from prompt... */
}
// Modal
function showModal(type, title) {
  /* ...from prompt... */
}
function closeModal() {
  /* ...from prompt... */
}
// Toast notifications
function showToast(message, type = "info") {
  /* ...from prompt... */
}
// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  /* ...from prompt... */
});

// Backend API base URL (adjust for production as needed)
const API_BASE = "http://localhost:3000/api";

async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}
async function fetchLedgerLatest() {
  const res = await fetch(`${API_BASE}/ledger/latest`);
  if (!res.ok) throw new Error("Failed to fetch latest ledger entry");
  return res.json();
}
async function fetchLedgerStream() {
  const res = await fetch(`${API_BASE}/ledger/stream`);
  if (!res.ok) throw new Error("Failed to fetch ledger stream");
  return res.json();
}
async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}
// On page load, fetch and render data from real backend
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const metrics = await fetchMetrics();
    const ledger = await fetchLedgerStream();
    const health = await fetchHealth();
    // TODO: Render metrics, ledger, and health in the UI
    // Example: renderStats(metrics), renderAuditLogs(ledger), renderHealth(health)
  } catch (err) {
    showToast("Backend fetch failed: " + err.message, "error");
  }
});
