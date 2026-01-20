export function canonicalize(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}
