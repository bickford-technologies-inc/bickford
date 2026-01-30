// Simple mock API endpoints for Canon Console (replace with real backend later)
import {
  modules,
  auditLogs,
  alerts,
  deployments,
  verification,
} from "./mockData.js";

export async function getModules() {
  return modules;
}

export async function getAuditLogs() {
  return auditLogs;
}

export async function getAlerts() {
  return alerts;
}

export async function getDeployments() {
  return deployments;
}

export async function getVerification() {
  return verification;
}
