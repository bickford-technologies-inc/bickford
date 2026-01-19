export type ContractOffer = {
  counterparty: string;
  proposedValueUsd: number;
  maxRisk: number;
};

export function negotiate(o: ContractOffer) {
  if (o.maxRisk > 0.1) return { accept: false, reason: "Risk too high" };
  if (o.proposedValueUsd < 500_000)
    return { accept: false, reason: "Below value floor" };

  return { accept: true, signedAt: new Date().toISOString() };
}
