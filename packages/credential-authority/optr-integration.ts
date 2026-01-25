// packages/credential-authority/optr-integration.ts
// MVP: Track which intents depend on which credentials
export type IntentId = string;
export type CredentialName = string;

const intentCredentialMap: Record<IntentId, CredentialName[]> = {};

export function registerIntentCredential(
  intentId: IntentId,
  cred: CredentialName,
) {
  if (!intentCredentialMap[intentId]) intentCredentialMap[intentId] = [];
  if (!intentCredentialMap[intentId].includes(cred))
    intentCredentialMap[intentId].push(cred);
}

export function getIntentsForCredential(cred: CredentialName): IntentId[] {
  return Object.entries(intentCredentialMap)
    .filter(([_, creds]) => creds.includes(cred))
    .map(([intentId]) => intentId);
}

export function updateIntentsOnCredentialRotation(
  cred: CredentialName,
  newVersion: number,
) {
  const affected = getIntentsForCredential(cred);
  for (const intentId of affected) {
    // In a real system, update the workflow to use the new credential version
    console.log(
      `[optr-integration] Updated intent ${intentId} to credential ${cred} v${newVersion}`,
    );
  }
  return affected;
}
