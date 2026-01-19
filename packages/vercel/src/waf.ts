// CANON — WAF CONTRACT PLACEHOLDER
// Implementation lives in integration layer

export interface VercelWAFManager {
  enableWAF(projectId: string): Promise<void>;
  disableWAF(projectId: string): Promise<void>;
}
