// platform/core/types.ts

export interface Canon {
  id: string;
  name: string;
  version: string;
  rules: CanonRule[];
  enforcement: "hard-fail" | "soft-fail";
  metadata?: Record<string, any>;
}

export interface CanonRule {
  id: string;
  type: "forbid" | "require";
  condition: string;
  action: string;
  severity: "critical" | "warning" | "info";
  message: string;
}

export interface Action {
  type: string;
  payload: any;
  context: {
    userId: string;
    organizationId: string;
    requestId: string;
    timestamp: string;
  };
}

export interface AppContext {
  userId: string;
  organizationId: string;
  requestId: string;
  ledger: any;
  enforcementEngine: any;
}

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  permissions: string[];
  pricing: Record<string, any>;
}

export interface AppResult {
  success: boolean;
  output?: any;
  error?: { code: string; message: string };
  compliance: {
    enforcementEvents: number;
    ledgerEntries: number;
    certificatesGenerated: number;
  };
  costs: {
    compute: number;
    storage: number;
    network: number;
  };
}
