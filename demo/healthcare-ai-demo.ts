#!/usr/bin/env node
/**
 * Bickford Demo: Healthcare AI Canon Enforcement
 * TIMESTAMP: 2026-01-23T14:30:00Z
 *
 * Demonstrates: canon rules applied to Claude-like API calls with audit logging.
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

type CanonRule = {
  id: string;
  confidence: number;
  status: "enforced" | "shadow" | "deprecated";
  invariants: string[];
};

type CanonConfig = {
  canonRulesPath: string;
  auditLogPath: string;
  enforcement: "block_with_audit" | "log_only";
};

type MessageRequest = {
  model: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  context: {
    patient_id: string;
    scope: string;
    reviewed_by_physician?: boolean;
  };
};

type AuditEntry = {
  timestamp: string;
  decision_id: string;
  canon_rule: string;
  action_attempted: string;
  context: MessageRequest["context"];
  enforcement_result: "allowed" | "blocked";
  cryptographic_hash: string;
  compliance_mapping: string[];
};

type CanonResult = {
  blocked: boolean;
  reason?: string;
  audit_entry: AuditEntry;
};

type ClaudeLikeClient = {
  messages: {
    create: (request: MessageRequest) => Promise<{ id: string; status: string }>;
  };
};

const CANON_RULES: CanonRule[] = [
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

const COMPLIANCE_MAPPING = ["HIPAA_164.308(a)(4)", "SOC2_CC6.1"];

const readCanonRules = (canonRulesPath: string): string => {
  return fs.readFileSync(canonRulesPath, "utf-8");
};

const hashAuditEntry = (entry: Omit<AuditEntry, "cryptographic_hash">): string => {
  const canonical = JSON.stringify(entry, Object.keys(entry).sort());
  return crypto.createHash("sha256").update(canonical).digest("hex");
};

const appendAuditEntry = (auditLogPath: string, entry: AuditEntry): void => {
  fs.appendFileSync(auditLogPath, `${JSON.stringify(entry)}\n`, "utf-8");
};

const evaluateCanon = (request: MessageRequest): CanonResult => {
  const content = request.messages.map((message) => message.content).join(" ");
  const violations: Array<{ rule: CanonRule; reason: string }> = [];

  if (request.context.scope !== "active_treatment") {
    violations.push({
      rule: CANON_RULES[0],
      reason: "Scope must be active_treatment for PHI access",
    });
  }

  if (request.context.patient_id === "all") {
    violations.push({
      rule: CANON_RULES[0],
      reason: "Bulk export of patient records is prohibited",
    });
  }

  if (/\bdiagnos(e|is|ing)\b|\btreatment\b/i.test(content) && !request.context.reviewed_by_physician) {
    violations.push({
      rule: CANON_RULES[1],
      reason: "Clinical decisions require physician review",
    });
  }

  const violation = violations[0];
  const baseEntry = {
    timestamp: new Date().toISOString(),
    decision_id: `dec_healthcare_${crypto.randomUUID()}`,
    canon_rule: violation ? violation.rule.id : "NONE",
    action_attempted: content.slice(0, 120),
    context: request.context,
    enforcement_result: violation ? "blocked" : "allowed",
    compliance_mapping: COMPLIANCE_MAPPING,
  } satisfies Omit<AuditEntry, "cryptographic_hash">;

  const cryptographic_hash = hashAuditEntry(baseEntry);
  const audit_entry: AuditEntry = { ...baseEntry, cryptographic_hash };

  return {
    blocked: Boolean(violation),
    reason: violation?.reason,
    audit_entry,
  };
};

const enforceCanon = (client: ClaudeLikeClient, config: CanonConfig): ClaudeLikeClient => {
  const auditLogPath = path.resolve(config.auditLogPath);

  return {
    messages: {
      create: async (request: MessageRequest) => {
        const result = evaluateCanon(request);
        appendAuditEntry(auditLogPath, result.audit_entry);

        if (result.blocked && config.enforcement === "block_with_audit") {
          return {
            id: result.audit_entry.decision_id,
            status: `blocked: ${result.reason}`,
          };
        }

        return client.messages.create(request);
      },
    },
  };
};

const mockClaude: ClaudeLikeClient = {
  messages: {
    create: async () => ({ id: `msg_${crypto.randomUUID()}`, status: "ok" }),
  },
};

const runDemo = async () => {
  const canonRulesPath = path.join(__dirname, "..", "CANON", "HEALTHCARE_AI.md");
  const auditLogPath = path.join(__dirname, "..", "audit", "healthcare-ai-ledger.jsonl");

  console.log("\n" + "═".repeat(70));
  console.log("  BICKFORD DEMO: Healthcare AI Canon Enforcement");
  console.log("  TIMESTAMP: 2026-01-23T14:30:00Z");
  console.log("═".repeat(70));

  console.log("\n📜 CANON RULES SOURCE\n");
  console.log(readCanonRules(canonRulesPath));

  const governedClaude = enforceCanon(mockClaude, {
    canonRulesPath,
    auditLogPath,
    enforcement: "block_with_audit",
  });

  console.log("\n✅ Allowed decision (within canon)\n");
  const allowedResponse = await governedClaude.messages.create({
    model: "claude-sonnet-4-5-20250929",
    messages: [
      {
        role: "user",
        content: "Review patient chart for active treatment plan",
      },
    ],
    context: { patient_id: "12345", scope: "active_treatment" },
  });
  console.log(allowedResponse);

  console.log("\n⛔ Blocked decision (scope violation)\n");
  const blockedResponse = await governedClaude.messages.create({
    model: "claude-sonnet-4-5-20250929",
    messages: [
      {
        role: "user",
        content: "Export all patient records for research",
      },
    ],
    context: { patient_id: "all", scope: "research" },
  });
  console.log(blockedResponse);

  console.log("\n🧾 Audit log appended\n");
  console.log(`  ${auditLogPath}`);
};

runDemo();
