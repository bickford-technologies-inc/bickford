export function exportJSONL(records: any[]) {
  return records.map((record) => JSON.stringify(record)).join("\n");
}
