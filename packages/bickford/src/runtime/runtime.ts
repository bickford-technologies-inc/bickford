/**
 * Bickford Decision Continuity Runtime
 * TIMESTAMP: 2026-01-12T03:06:00Z
 * 
 * Core runtime that integrates:
 * - Intent capture and validation
 * - Canon-based authorization
 * - OPTR decision making
 * - Hash-linked ledger
 * - Deterministic execution
 */

import { HashLinkedLedger, LedgerEntry } from "./ledger";
import {
  Action,
  LedgerEvent,
  WhyNotTrace,
  OPTRRun,
  CandidatePath,
  CanonLevel,
  DenialReasonCode,
  OPTRWeights
} from "../canon/types";
import {
  requireCanonRefs,
  INVARIANTS
} from "../canon/invariants";
import {
  runOPTR,
  extractFeatures
} from "../canon/optr";

export type ExecutionIntent = {
  goal: string;
  tenantId: string;
  actor: string;
  candidatePaths: CandidatePath[];
  canonRefsUsed: string[];
};

export type ExecutionResult = {
  allowed: boolean;
  selectedAction?: Action;
  denyTraces?: WhyNotTrace[];
  ledgerEntry: LedgerEntry;
  optrRun?: OPTRRun;
};

export type RuntimeConfig = {
  weights?: OPTRWeights;
};

/**
 * Bickford Runtime
 * 
 * Enforces Canon invariants, executes OPTR, maintains append-only ledger.
 * No hidden state - all decisions recorded immutably.
 */
export class BickfordRuntime {
  private ledger: HashLinkedLedger;
  private canonStore: Map<string, { level: CanonLevel }>;
  private weights: OPTRWeights;

  constructor(config: RuntimeConfig = {}) {
    this.ledger = new HashLinkedLedger();
    this.canonStore = new Map();
    
    // Initialize with canonical invariants
    for (const inv of INVARIANTS) {
      this.canonStore.set(inv.id, { level: inv.level });
    }

    // Default OPTR weights
    this.weights = config.weights || {
      lambdaC: 1.0,  // Cost
      lambdaR: 2.0,  // Risk
      lambdaP: 0.5   // Success probability
    };
  }

  /**
   * Execute an intent through the Canon framework
   * 
   * Returns execution result with ledger entry
   */
  execute(intent: ExecutionIntent): ExecutionResult {
    const nowIso = new Date().toISOString();

    // Step 1: Record intent in ledger
    const intentEvent: LedgerEvent = {
      id: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ts: nowIso,
      actor: intent.actor,
      tenantId: intent.tenantId,
      kind: "INTENT",
      payload: {
        goal: intent.goal,
        candidateCount: intent.candidatePaths.length
      },
      provenance: {
        source: "prod",
        ref: "runtime-v1.0.0",
        author: intent.actor
      }
    };

    this.ledger.append(intentEvent);

    // Step 2: Run OPTR to select best path
    const canonIds = new Set(this.canonStore.keys());
    const optrRun = runOPTR({
      ts: nowIso,
      tenantId: intent.tenantId,
      goal: intent.goal,
      candidates: intent.candidatePaths,
      canonIds,
      weights: this.weights,
      featureExtractor: extractFeatures
    });

    // Step 3: Check if any action was selected
    if (!optrRun.selectedNextActionId) {
      // All paths denied - record denial
      const denyEvent: LedgerEvent = {
        id: `deny_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ts: nowIso,
        actor: intent.actor,
        tenantId: intent.tenantId,
        kind: "DENY",
        payload: {
          goal: intent.goal,
          denyTraces: optrRun.denyTraces
        },
        provenance: {
          source: "prod",
          ref: "runtime-v1.0.0",
          author: "system"
        }
      };

      const ledgerEntry = this.ledger.append(denyEvent);

      return {
        allowed: false,
        denyTraces: optrRun.denyTraces,
        ledgerEntry,
        optrRun
      };
    }

    // Step 4: Authority boundary check
    const authCheck = requireCanonRefs(
      optrRun.selectedNextActionId,
      intent.canonRefsUsed,
      this.canonStore
    );

    if (!authCheck.ok) {
      // Authority violation - hard fail
      const denyTrace: WhyNotTrace = {
        ts: nowIso,
        actionId: optrRun.selectedNextActionId,
        denied: true,
        reasonCodes: [DenialReasonCode.AUTHORITY_BOUNDARY_FAIL],
        missingCanonIds: authCheck.missingRefs,
        requiredCanonRefs: intent.canonRefsUsed,
        message: authCheck.message || "Authority boundary violation"
      };

      const denyEvent: LedgerEvent = {
        id: `deny_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ts: nowIso,
        actor: intent.actor,
        tenantId: intent.tenantId,
        kind: "DENY",
        payload: {
          goal: intent.goal,
          denyTraces: [denyTrace]
        },
        provenance: {
          source: "prod",
          ref: "runtime-v1.0.0",
          author: "system"
        }
      };

      const ledgerEntry = this.ledger.append(denyEvent);

      return {
        allowed: false,
        denyTraces: [denyTrace],
        ledgerEntry,
        optrRun
      };
    }

    // Step 5: Action approved - record it
    const selectedPath = intent.candidatePaths.find(
      p => p.id === optrRun.selectedPathId
    );
    const selectedAction = selectedPath?.actions.find(
      a => a.id === optrRun.selectedNextActionId
    );

    const actionEvent: LedgerEvent = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ts: nowIso,
      actor: intent.actor,
      tenantId: intent.tenantId,
      kind: "ACTION",
      payload: {
        goal: intent.goal,
        actionId: optrRun.selectedNextActionId,
        actionName: selectedAction?.name,
        pathId: optrRun.selectedPathId
      },
      provenance: {
        source: "prod",
        ref: "runtime-v1.0.0",
        author: intent.actor
      }
    };

    const ledgerEntry = this.ledger.append(actionEvent);

    return {
      allowed: true,
      selectedAction,
      ledgerEntry,
      optrRun
    };
  }

  /**
   * Verify ledger integrity
   */
  verifyLedger(): boolean {
    return this.ledger.verify();
  }

  /**
   * Get ledger entries
   */
  getLedger(): ReadonlyArray<LedgerEntry> {
    return this.ledger.getEntries();
  }

  /**
   * Get ledger size
   */
  getLedgerSize(): number {
    return this.ledger.size();
  }

  /**
   * Add a canon item to the store
   */
  addCanonItem(id: string, level: CanonLevel): void {
    this.canonStore.set(id, { level });
  }
}
