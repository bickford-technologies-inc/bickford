// CANON — PURE CONTRACT ONLY
// Implementation intentionally deferred to integration layer

export interface NotaryStorage {
  putObject(key: string, body: Uint8Array): Promise<void>;
  getObject(key: string): Promise<Uint8Array>;
}
