// packages/credential-authority/index.ts
// Minimal in-repo credential authority service for Bickford
// Stores, versions, rotates, and fetches credentials (in-memory MVP)

export type CredentialRecord = {
  name: string;
  value: string;
  version: number;
  createdAt: number;
  replacedBy?: number;
};

const credentialStore: Record<string, CredentialRecord[]> = {};

export function setCredential(name: string, value: string): CredentialRecord {
  const now = Date.now();
  const prev = credentialStore[name]?.[credentialStore[name].length - 1];
  const version = prev ? prev.version + 1 : 1;
  const record: CredentialRecord = { name, value, version, createdAt: now };
  if (!credentialStore[name]) credentialStore[name] = [];
  if (prev) prev.replacedBy = version;
  credentialStore[name].push(record);
  return record;
}

export function getCredential(name: string): CredentialRecord | undefined {
  const arr = credentialStore[name];
  if (!arr || arr.length === 0) return undefined;
  return arr[arr.length - 1];
}

export function rotateCredential(
  name: string,
  newValue: string,
): CredentialRecord {
  return setCredential(name, newValue);
}

export function getCredentialHistory(name: string): CredentialRecord[] {
  return credentialStore[name] || [];
}
