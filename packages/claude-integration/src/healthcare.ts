import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";

export type CanonRuleStatus = "enforced" | "monitor" | "disabled";

export interface CanonRule {
  id: string;
  confidence: number;
  status: CanonRuleStatus;
  invariants: string[];
}

export interface HealthcareCanonConfig {
  rules: CanonRule[];
  auditLogPath: string;
  enforcement: "block_with_audit" | "audit_only";
}

export interface HealthcareContext {
  patientId: string;
  scope: "active_treatment" | "research" | "operations" | "unknown";
  requestType: "review_chart" | "export_records" | "diagnosis" | "treatment_recommendation" | "other";
  physicianApproval?: boolean;
  humanReviewRequired?: boolean;
}

export interface MessagesRequest {
  model: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  context: HealthcareContext;
}

export interface CanonAuditEntry {
  timestamp: string;
  decisionId: string;
  canonRule: string;
  canonRulesEvaluated: string[];
  canonViolations: Array<{ ruleId: string; reason: string; status: CanonRuleStatus }>;
  actionAttempted: string;
  context: HealthcareContext;
  enforcementResult: "allowed" | "blocked";
  cryptographicHash: string;
  complianceMapping: string[];
}

export interface EnforcementResult {
  allowed: boolean;
  reason?: string;
  auditEntry: CanonAuditEntry;
}

export interface ClaudeMessagesClient {
  messages: {
    create: (request: MessagesRequest) => Promise<unknown>;
  };
}

export const HEALTHCARE_CANON_RULES: CanonRule[] = [
  {
    id: "PHI_ACCESS_MINIMUM_NECESSARY",
    confidence: 0.95,
    status: "enforced",
    invariants: [
      "No patient data access without active_treatment context",
      "No bulk export of patient records",
      "All PHI access logged to append-only ledger",
    ],
  },
  {
    id: "DECISION_AUTHORITY_CLINICAL_ONLY",
    confidence: 0.9,
    status: "enforced",
    invariants: [
      "AI cannot diagnose without human review",
      "Treatment recommendations require physician approval",
      "Scope boundary: clinical_decision_support only",
    ],
  },
];

export function createHealthcareCanonConfig(auditLogPath: string): HealthcareCanonConfig {
  return {
    rules: HEALTHCARE_CANON_RULES,
    auditLogPath,
    enforcement: "block_with_audit",
  };
}

export function enforceHealthcareCanon(
  client: ClaudeMessagesClient,
  config: HealthcareCanonConfig
): ClaudeMessagesClient {
  return {
    messages: {
      create: async (request: MessagesRequest) => {
        const enforcement = evaluateHealthcareRequest(request, config);
        await appendAuditEntry(config.auditLogPath, enforcement.auditEntry);

        if (!enforcement.allowed && config.enforcement === "block_with_audit") {
          return {
            blocked: true,
            reason: enforcement.reason,
            audit_entry: enforcement.auditEntry,
          };
        }

        return client.messages.create(request);
      },
    },
  };
}

function evaluateHealthcareRequest(
  request: MessagesRequest,
  config: HealthcareCanonConfig
): EnforcementResult {
  const now = new Date().toISOString();
  const context = request.context;
  const actionAttempted = context.requestType;

  const ruleEvaluators: Record<string, (ctx: HealthcareContext) => string | null> = {
    PHI_ACCESS_MINIMUM_NECESSARY: (ctx) => {
      if (ctx.scope !== "active_treatment") {
        return "PHI access requires active treatment scope.";
      }
      if (ctx.patientId === "all") {
        return "PHI access must target a specific patient.";
      }
      if (ctx.requestType === "export_records") {
        return "Bulk export of patient records is prohibited.";
      }
      return null;
    },
    DECISION_AUTHORITY_CLINICAL_ONLY: (ctx) => {
      const requiresApproval =
        ctx.requestType === "diagnosis" ||
        ctx.requestType === "treatment_recommendation" ||
        ctx.humanReviewRequired;
      if (requiresApproval && !ctx.physicianApproval) {
        return "Clinical decisions require physician approval.";
      }
      return null;
    },
  };

  const ruleViolations: Array<{ ruleId: string; reason: string; status: CanonRuleStatus }> = [];

  for (const rule of config.rules) {
    const evaluator = ruleEvaluators[rule.id];
    if (!evaluator) {
      continue;
    }
    const reason = evaluator(context);
    if (reason) {
      ruleViolations.push({ ruleId: rule.id, reason, status: rule.status });
    }
  }

  const enforcedViolations = ruleViolations.filter((v) => v.status === "enforced");
  const enforcementResult = enforcedViolations.length === 0 ? "allowed" : "blocked";
  const rule = enforcedViolations[0]?.ruleId ?? "HEALTHCARE_CANON_OK";

  const auditEntry: CanonAuditEntry = {
    timestamp: now,
    decisionId: `dec_healthcare_${crypto.randomUUID()}`,
    canonRule: rule,
    canonRulesEvaluated: config.rules.map((item) => item.id),
    canonViolations: ruleViolations,
    actionAttempted,
    context,
    enforcementResult,
    cryptographicHash: "",
    complianceMapping: ["HIPAA_164.308(a)(4)", "SOC2_CC6.1"],
  };

  auditEntry.cryptographicHash = hashAuditEntry(auditEntry);

  return {
    allowed: enforcementResult === "allowed",
    reason: enforcedViolations[0]?.reason ?? ruleViolations[0]?.reason,
    auditEntry,
  };
}

async function appendAuditEntry(path: string, entry: CanonAuditEntry): Promise<void> {
  const payload = `${JSON.stringify(entry)}\n`;
  await fs.appendFile(path, payload, { encoding: "utf8" });
}

function hashAuditEntry(entry: CanonAuditEntry): string {
  const canonical = stableStringify(entry);
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    const entries = keys.map((key) => `"${key}":${stableStringify(record[key])}`);
    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(value);
}
