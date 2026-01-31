// platform/sdk/app.ts
import type { AppManifest, AppContext, AppResult } from "../core/types";

export abstract class BickfordNativeApp {
  abstract manifest: AppManifest;
  protected context: AppContext;

  constructor(context: AppContext) {
    this.context = context;
  }

  async log(event: string, data: Record<string, unknown>) {
    await this.context.ledger.append({
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async generateProof(details: Record<string, unknown>) {
    return { id: "cert-" + Math.random().toString(36).slice(2), ...details };
  }

  async enforce(canon: Record<string, unknown>, action: Record<string, unknown>) {
    return this.context.enforcementEngine.enforce(canon, action);
  }

  abstract execute(input: any, context: AppContext): Promise<AppResult>;
}

export type { AppManifest, AppContext, AppResult };
