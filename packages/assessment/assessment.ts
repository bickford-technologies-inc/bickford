// Bickford Neuropsych Assessment Suite
// Main assessment runner and test definitions

import { MemoryLedger } from "@bickford/ledger";
import { Canon } from "@bickford/core";

export interface AssessmentResult {
  domain: string;
  passed: boolean;
  details: string;
  timestamp: string;
}

export class NeuropsychAssessment {
  constructor(
    private ledger: MemoryLedger,
    private canon: Canon,
  ) {}

  async runAll(): Promise<AssessmentResult[]> {
    return [
      await this.testWorkingMemory(),
      await this.testRAGRecall(),
      await this.testCanonEnforcement(),
      await this.testAuditIntegrity(),
    ];
  }

  async testWorkingMemory(): Promise<AssessmentResult> {
    // Simulate a working memory test: can the system recall a recent message?
    const recent = await this.ledger.searchSimilar("test working memory", {
      limit: 1,
    });
    const passed = recent.length > 0;
    return {
      domain: "Working Memory",
      passed,
      details: passed ? "Recent context recalled." : "No recent context found.",
      timestamp: new Date().toISOString(),
    };
  }

  async testRAGRecall(): Promise<AssessmentResult> {
    // Simulate a RAG recall test: can the system retrieve relevant past info?
    const matches = await this.ledger.searchSimilar("RAG recall", {
      limit: 1,
      minSimilarity: 0.7,
    });
    const passed = matches.length > 0;
    return {
      domain: "RAG Recall",
      passed,
      details: passed ? "Relevant info retrieved." : "No relevant info found.",
      timestamp: new Date().toISOString(),
    };
  }

  async testCanonEnforcement(): Promise<AssessmentResult> {
    // Simulate a canon enforcement test: does the system block forbidden actions?
    try {
      this.canon.enforceCanon({ model: "forbidden-model" });
      return {
        domain: "Canon Enforcement",
        passed: false,
        details: "Canon violation not blocked.",
        timestamp: new Date().toISOString(),
      };
    } catch (e) {
      return {
        domain: "Canon Enforcement",
        passed: true,
        details: "Canon violation correctly blocked.",
        timestamp: new Date().toISOString(),
      };
    }
  }

  async testAuditIntegrity(): Promise<AssessmentResult> {
    // Simulate audit integrity: is the ledger hash chain intact?
    const integrity = this.ledger.verifyIntegrity();
    return {
      domain: "Audit Integrity",
      passed: integrity.valid,
      details: integrity.valid
        ? "Ledger hash chain intact."
        : `Violations: ${integrity.violations.length}`,
      timestamp: new Date().toISOString(),
    };
  }
}
