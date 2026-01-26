/**
 * Workflow Executor
 * Executes JSON-defined workflows with platform integration
 */

import type {
  WorkflowDefinition,
  WorkflowStep,
  ExecutionContext,
  WorkflowResult,
} from "../types";

export class WorkflowExecutor {
  constructor(
    private platform: any, // Platform runtime
    private context: ExecutionContext,
  ) {}

  async execute(workflow: WorkflowDefinition): Promise<WorkflowResult> {
    const startTime = Date.now();
    let output: any = null;

    try {
      for (const step of workflow.steps) {
        output = await this.executeStep(step, output);
      }

      return {
        success: true,
        output,
        metadata: {
          executionTime: Date.now() - startTime,
          stepCount: workflow.steps.length,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: "WORKFLOW_EXECUTION_FAILED",
          message: error.message,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          stepCount: workflow.steps.length,
        },
      };
    }
  }

  private async executeStep(
    step: WorkflowStep,
    previousOutput: any,
  ): Promise<any> {
    switch (step.type) {
      case "fetch":
        return await this.executeFetch(step);

      case "transform":
        return await this.executeTransform(step, previousOutput);

      case "render":
        return await this.executeRender(step, previousOutput);

      case "enforce":
        return await this.executeEnforce(step, previousOutput);

      case "compress":
        return await this.executeCompress(step, previousOutput);

      case "verify":
        return await this.executeVerify(step, previousOutput);

      case "ledger-append":
        return await this.executeLedgerAppend(step, previousOutput);

      case "proof-generate":
        return await this.executeProofGenerate(step, previousOutput);

      default:
        throw new Error(`Unknown workflow step type: ${step.type}`);
    }
  }

  private async executeFetch(step: WorkflowStep): Promise<any> {
    const { resource, params } = step;

    // Resolve parameters from context
    const resolvedParams = this.resolveParams(params || {});

    // Fetch from platform resources
    switch (resource) {
      case "decisionLedger":
        return await this.platform.ledger.getEntries(
          resolvedParams.limit || 100,
        );

      case "compressionMetrics":
        return await this.platform.compression.getMetrics();

      case "enforcementHistory":
        return await this.platform.enforcement.getHistory(resolvedParams);

      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  }

  private async executeTransform(step: WorkflowStep, input: any): Promise<any> {
    const { transform } = step;

    if (!transform) {
      return input;
    }

    // Execute transformation (simplified - real implementation would use safe eval)
    try {
      const transformFn = new Function(
        "data",
        "context",
        `return ${transform}`,
      );
      return transformFn(input, this.context);
    } catch (error) {
      throw new Error(`Transform failed: ${error}`);
    }
  }

  private async executeRender(step: WorkflowStep, input: any): Promise<any> {
    // Return render instruction for UI layer
    return {
      type: "render",
      target: step.target,
      schema: step.schema,
      data: input,
    };
  }

  private async executeEnforce(step: WorkflowStep, input: any): Promise<any> {
    const { params } = step;
    return await this.platform.enforcementEngine.enforce(
      params.canon,
      params.action,
    );
  }

  private async executeCompress(step: WorkflowStep, input: any): Promise<any> {
    return await this.platform.compression.compress(input);
  }

  private async executeVerify(step: WorkflowStep, input: any): Promise<any> {
    return await this.platform.verification.verify(input);
  }

  private async executeLedgerAppend(
    step: WorkflowStep,
    input: any,
  ): Promise<any> {
    return await this.platform.ledger.append({
      eventType: step.params?.eventType || "workflow.execution",
      payload: input,
      metadata: {
        timestamp: new Date().toISOString(),
        executionContext: this.context,
      },
    });
  }

  private async executeProofGenerate(
    step: WorkflowStep,
    input: any,
  ): Promise<any> {
    return await this.platform.proofGenerator.generate({
      decision: input.decision,
      policyId: input.policyId,
      metadata: input,
    });
  }

  private resolveParams(params: Record<string, any>): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string" && value.startsWith("$context.")) {
        const contextKey = value.substring(9); // Remove "$context."
        resolved[key] = (this.context as any)[contextKey];
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }
}
