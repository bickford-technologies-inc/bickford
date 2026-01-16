export type CanarySample = {
  ts: number;
  tenantId: string;
  region: string;
  latencyMs: number;
  ok: boolean;
};

const samples: CanarySample[] = [];

export function recordSample(s: CanarySample) {
  samples.push(s);
}

export function windowSamples(
  tenantId: string,
  region: string,
  windowMs: number
) {
  const since = Date.now() - windowMs;
  return samples.filter(
    (s) => s.tenantId === tenantId && s.region === region && s.ts >= since
  );
}
