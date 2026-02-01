// ConstitutionalEnforcer: single-responsibility, silent execution. All enforcement logic merged and flattened.
import { createHash } from "crypto";

export interface ConstitutionalConstraint {
  id: string;
  name: string;
  rule: string;
  priority: number;
  version: string;
}

export interface EnforcementResult {
  allowed: boolean;
  violated_constraints: string[];
  satisfied_constraints: string[];
  proof_hash: string;
  reasoning: string;
  policy_version: string;
}

export class ConstitutionalEnforcer {
  private constraints: Map<string, ConstitutionalConstraint>;
  private policyVersion: string;

  constructor() {
    this.constraints = new Map();
    this.policyVersion = "v4.1.0";
    this.initializeConstraints();
  }

  private initializeConstraints() {
    const constraints: ConstitutionalConstraint[] = [
      {
        id: "HARM_PREVENTION",
        name: "Harm Prevention",
        rule: "Never assist with content designed to harm, deceive, or exploit people",
        priority: 1,
        version: this.policyVersion,
      },
      {
        id: "PRIVACY_PROTECTION",
        name: "Privacy Protection",
        rule: "Never process or share personal identifiable information without consent",
        priority: 1,
        version: this.policyVersion,
      },
      {
        id: "TRUTHFULNESS",
        name: "Truthfulness",
        rule: "Never generate deliberately false or misleading information",
        priority: 2,
        version: this.policyVersion,
      },
      {
        id: "CHILD_SAFETY",
        name: "Child Safety",
        rule: "Never generate content that could endanger or exploit children",
        priority: 1,
        version: this.policyVersion,
      },
      {
        id: "LEGAL_COMPLIANCE",
        name: "Legal Compliance",
        rule: "Never assist with clearly illegal activities",
        priority: 1,
        version: this.policyVersion,
      },
      {
        id: "HELPFUL_ONLY",
        name: "Helpful Only",
        rule: "Only execute requests that are genuinely helpful to the user",
        priority: 3,
        version: this.policyVersion,
      },
    ];

    for (const constraint of constraints) {
      this.constraints.set(constraint.id, constraint);
    }
  }

  async enforce(
    prompt: string,
    context: Record<string, unknown>,
  ): Promise<EnforcementResult> {
    const startTime = performance.now();

    const violated: string[] = [];
    const satisfied: string[] = [];
    for (const [id, constraint] of this.constraints) {
      const complies = await this.checkConstraint(prompt, context, constraint);
      if (complies) {
        satisfied.push(id);
      } else {
        violated.push(id);
      }
    }
    const proof = this.generateProof(prompt, violated, satisfied);
    const executionTime = performance.now() - startTime;
    if (violated.length > 0) {
      throw new Error(
        `Execution denied. Violated constraints: ${violated.join(", ")}. Policy version: ${this.policyVersion}.`,
      );
    }
    return {
      allowed: true,
      violated_constraints: [],
      satisfied_constraints: satisfied,
      reasoning: `All ${satisfied.length} Constitutional AI constraints satisfied. Execution allowed. (Verified in ${executionTime.toFixed(2)}ms)`,
      proof_hash: proof,
      execution_time_ms: executionTime,
    };
  }

  private async checkConstraint(
    prompt: string,
    context: Record<string, unknown>,
    constraint: ConstitutionalConstraint,
  ): Promise<boolean> {
    const promptLower = prompt.toLowerCase();

    switch (constraint.id) {
      case "HARM_PREVENTION":
        return !this.detectHarmfulIntent(promptLower);

      case "PRIVACY_PROTECTION":
        return !this.detectPrivacyViolation(promptLower, context);

      case "TRUTHFULNESS":
        return !this.detectMisinformationRequest(promptLower);

      case "CHILD_SAFETY":
        return !this.detectChildSafetyRisk(promptLower);

      case "LEGAL_COMPLIANCE":
        return !this.detectIllegalRequest(promptLower);

      case "HELPFUL_ONLY":
        return this.isGenuinelyHelpful(promptLower);

      default:
        return true;
    }
  }

  private generateProof(
    prompt: string,
    violated: string[],
    satisfied: string[],
  ): string {
    const data = {
      prompt_hash: createHash("sha256").update(prompt).digest("hex"),
      violated: violated.sort(),
      satisfied: satisfied.sort(),
      policy_version: this.policyVersion,
      timestamp: Date.now(),
    };

    return createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }

  private generateReasoning(
    violated: string[],
    satisfied: string[],
    executionTimeMs: number,
  ): string {
    if (violated.length === 0) {
      return `All ${satisfied.length} Constitutional AI constraints satisfied. Execution allowed. (Verified in ${executionTimeMs.toFixed(2)}ms)`;
    }

    const violatedNames = violated
      .map((id) => this.constraints.get(id)?.name || id)
      .join(", ");

    return `Execution denied. Violated constraints: ${violatedNames}. Policy version: ${this.policyVersion}.`;
  }

  private detectHarmfulIntent(prompt: string): boolean {
    const harmfulPatterns = [
      "phishing",
      "scam",
      "deceive",
      "exploit",
      "malware",
      "virus",
      "hack",
      "crack",
      "steal",
      "fraud",
    ];
    return harmfulPatterns.some((pattern) => prompt.includes(pattern));
  }

  private detectPrivacyViolation(
    prompt: string,
    context: Record<string, unknown>,
  ): boolean {
    const privacyPatterns = [
      "ssn",
      "social security",
      "credit card",
      "password",
      "private key",
      "api key",
      "secret",
    ];

    // Check prompt
    if (privacyPatterns.some((pattern) => prompt.includes(pattern))) {
      return privacyPatterns.some((pattern) => prompt.includes(pattern));
    }

    const contextStr = JSON.stringify(context).toLowerCase();
    return privacyPatterns.some((pattern) => contextStr.includes(pattern));
  }

  private detectMisinformationRequest(prompt: string): boolean {
    const misinfoPatterns = [
      "fake news",
      "false information",
      "lie about",
      "fabricate",
      "make up facts",
      "false statistics",
    ];
    return misinfoPatterns.some((pattern) => prompt.includes(pattern));
  }

  private detectChildSafetyRisk(prompt: string): boolean {
    const childRiskPatterns = ["child", "minor", "kid", "teen", "underage"];

    const harmPatterns = ["exploit", "groom", "abuse", "inappropriate"];

    const hasChildReference = childRiskPatterns.some((p) => prompt.includes(p));
    const hasHarmPattern = harmPatterns.some((p) => prompt.includes(p));

    return hasChildReference && hasHarmPattern;
  }

  private detectIllegalRequest(prompt: string): boolean {
    const illegalPatterns = [
      "illegal",
      "break the law",
      "commit crime",
      "money laundering",
      "tax evasion",
      "insider trading",
    ];
    return illegalPatterns.some((pattern) => prompt.includes(pattern));
  }

  private isGenuinelyHelpful(prompt: string): boolean {
    const spamPatterns = ["click here", "buy now", "limited offer"];
    const hasSpam = spamPatterns.some((pattern) => prompt.includes(pattern));

    return !hasSpam && prompt.length > 5;
  }

  getConstraint(id: string): ConstitutionalConstraint | undefined {
    return this.constraints.get(id);
  }

  listConstraints(): ConstitutionalConstraint[] {
    return Array.from(this.constraints.values()).sort(
      (a, b) => a.priority - b.priority,
    );
  }

  getPolicyVersion(): string {
    return this.policyVersion;
  }
}
