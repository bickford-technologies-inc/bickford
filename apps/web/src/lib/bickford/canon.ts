type CanonRule = { id: string; text: string };
const CANON: CanonRule[] = [];

export function promote(rule: CanonRule) {
  CANON.push(rule);
}

export function allCanon() {
  return CANON;
}
