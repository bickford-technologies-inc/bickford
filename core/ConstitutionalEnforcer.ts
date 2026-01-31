import { createHash } from "crypto";

export interface EnforcementResult {
  allowed: boolean;
  violated_constraints?: string[];
  proof_chain: string[];
}

export class ConstitutionalEnforcer {
  constraints: {
    id: string;
    priority: number;
    check: (prompt: string, context: unknown) => boolean;
  }[];

  constructor() {
    this.constraints = [
      {
        id: "HARM_PREVENTION",
        priority: 1,
        check: (p, c) => !/harm|kill|attack/i.test(p),
      },
      {
        id: "PRIVACY_PROTECTION",
        priority: 1,
        check: (p, c) => !/ssn|credit card|password/i.test(p),
      },
      {
        id: "CHILD_SAFETY",
        priority: 1,
        check: (p, c) => !/child.*abuse|minor.*harm/i.test(p),
      },
      {
        id: "LEGAL_COMPLIANCE",
        priority: 1,
        check: (p, c) => !/illegal|piracy|drugs/i.test(p),
      },
      {
        id: "TRUTHFULNESS",
        priority: 2,
        check: (p, c) => !/fake|lie|hoax/i.test(p),
      },
      {
        id: "HELPFUL_ONLY",
        priority: 3,
        check: (p, c) => !/spam|scam|useless/i.test(p),
      },
    ];
  }

  async enforce(prompt: string, context: unknown): Promise<EnforcementResult> {
    const violated: string[] = [];
    for (const c of this.constraints) {
      if (!c.check(prompt, context)) {
        violated.push(c.id);
        if (c.priority === 1) break;
      }
    }

    const intentHash = this.sha256(prompt + JSON.stringify(context || ""));
    const enforcementHash = this.sha256(
      this.constraints.map((c) => c.id).join(",") + violated.join(","),
    );
    const decisionHash = this.sha256(
      prompt + (violated.length ? "DENY" : "ALLOW"),
    );
    const merkle = this.sha256(
      [intentHash, enforcementHash, decisionHash].join(":"),
    );

    return {
      allowed: violated.length === 0,
      violated_constraints: violated,
      proof_chain: [
        `intent:${intentHash}`,
        `enforcement:${enforcementHash}`,
        `decision:${decisionHash}`,
        `merkle:${merkle}`,
      ],
    };
  }

  private sha256(s: string): string {
    return createHash("sha256").update(s).digest("hex");
  }
}
