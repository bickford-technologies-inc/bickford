// CANON — DOMAINS CONTRACT PLACEHOLDER
// Implementation lives in integration layer

export interface VercelDomainManager {
  addDomain(projectId: string, domain: string): Promise<void>;
  removeDomain(projectId: string, domain: string): Promise<void>;
}
