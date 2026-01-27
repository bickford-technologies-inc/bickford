import { createHash } from "crypto";
import { BICKFORD_ROOT } from "./bickford-root";

export interface Decision {
  timestamp: number;
  action: string;
  constraints: string[];
  outcome: "allowed" | "blocked";
  reason: string;
}

export interface DecisionRecord {
  decision: Decision;
  hash: Buffer;
  previousHash: Buffer;
  merkleRoot: Buffer;
}

export interface ReconstructionProof {
  decisions: Decision[];
  finalHash: Buffer;
  merkleRoot: Buffer;
  bickfordRoot: Buffer;
  isValid: boolean;
  statistics: {
    totalDecisions: number;
    allowedDecisions: number;
    blockedDecisions: number;
    avgConstraintsPerDecision: number;
    reconstructionTime: number;
  };
}

export class ReconstructionEngine {
  private static hashDecision(
    decision: Decision,
    previousHash: Buffer,
  ): Buffer {
    const decisionData = JSON.stringify({
      timestamp: decision.timestamp,
      action: decision.action,
      constraints: decision.constraints.sort(),
      outcome: decision.outcome,
      reason: decision.reason,
    });

    return createHash("sha256")
      .update(previousHash)
      .update(decisionData)
      .digest();
  }

  static reconstruct(
    decisions: Decision[],
    merkleRoot: Buffer,
  ): ReconstructionProof {
    const startTime = Date.now();

    let currentHash = BICKFORD_ROOT;
    const records: DecisionRecord[] = [];
    let allowedCount = 0;
    let blockedCount = 0;
    let totalConstraints = 0;

    for (const decision of decisions) {
      const previousHash = currentHash;
      currentHash = this.hashDecision(decision, previousHash);

      records.push({
        decision,
        hash: currentHash,
        previousHash,
        merkleRoot,
      });

      if (decision.outcome === "allowed") {
        allowedCount++;
      } else {
        blockedCount++;
      }
      totalConstraints += decision.constraints.length;
    }

    const finalHash = currentHash;
    const isValid = finalHash.equals(merkleRoot);
    const reconstructionTime = Date.now() - startTime;

    return {
      decisions,
      finalHash,
      merkleRoot,
      bickfordRoot: BICKFORD_ROOT,
      isValid,
      statistics: {
        totalDecisions: decisions.length,
        allowedDecisions: allowedCount,
        blockedDecisions: blockedCount,
        avgConstraintsPerDecision:
          decisions.length > 0 ? totalConstraints / decisions.length : 0,
        reconstructionTime,
      },
    };
  }

  static reconstructSingle(
    decision: Decision,
    previousHash: Buffer,
    expectedHash: Buffer,
  ): boolean {
    const reconstructedHash = this.hashDecision(decision, previousHash);
    return reconstructedHash.equals(expectedHash);
  }

  static generateComplianceReport(proof: ReconstructionProof): string {
    const { statistics, isValid, decisions } = proof;

    const report = [
      "=== BICKFORD COMPLIANCE CERTIFICATE ===",
      "",
      `Chain Valid: ${isValid ? "✓ YES" : "✗ NO"}`,
      `Total Decisions: ${statistics.totalDecisions.toLocaleString()}`,
      `Allowed: ${statistics.allowedDecisions.toLocaleString()}`,
      `Blocked: ${statistics.blockedDecisions.toLocaleString()}`,
      `Avg Constraints/Decision: ${statistics.avgConstraintsPerDecision.toFixed(2)}`,
      `Reconstruction Time: ${statistics.reconstructionTime}ms`,
      "",
      `Root Hash: ${proof.merkleRoot.toString("hex")}`,
      `Bickford Root: ${proof.bickfordRoot.toString("hex")}`,
      "",
      "=== SAMPLE DECISIONS ===",
      "",
    ];

    const sampleDecisions = [
      ...decisions.slice(0, Math.min(5, decisions.length)),
      ...(decisions.length > 10 ? decisions.slice(-5) : []),
    ];

    sampleDecisions.forEach((d, i) => {
      const isLast = i >= Math.min(5, decisions.length);
      const actualIndex = isLast
        ? decisions.length - (sampleDecisions.length - i)
        : i;

      report.push(`Decision #${actualIndex + 1}:`);
      report.push(`  Action: ${d.action}`);
      report.push(`  Outcome: ${d.outcome.toUpperCase()}`);
      report.push(`  Constraints: ${d.constraints.length}`);
      report.push("");
    });

    if (decisions.length > 10) {
      report.push(`... (${decisions.length - 10} decisions omitted) ...`);
      report.push("");
    }

    return report.join("\n");
  }

  static quickVerify(
    decisionHashes: Buffer[],
    expectedMerkleRoot: Buffer,
  ): boolean {
    if (decisionHashes.length === 0) {
      return false;
    }

    const finalHash = decisionHashes[decisionHashes.length - 1];
    return finalHash.equals(expectedMerkleRoot);
  }

  static exportProof(proof: ReconstructionProof): string {
    return JSON.stringify(
      {
        finalHash: proof.finalHash.toString("hex"),
        merkleRoot: proof.merkleRoot.toString("hex"),
        bickfordRoot: proof.bickfordRoot.toString("hex"),
        isValid: proof.isValid,
        statistics: proof.statistics,
        decisionCount: proof.decisions.length,
        sampleDecisions: proof.decisions.slice(0, 3).map((d) => ({
          action: d.action,
          outcome: d.outcome,
          constraintCount: d.constraints.length,
        })),
      },
      null,
      2,
    );
  }
}
