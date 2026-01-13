import { normalizeIntent } from "../normalize";
import { Intent } from "../types";

// API ingestion: parse POST body, normalize, and emit Intent
export function ingestFromAPI(body: any): Intent {
  return normalizeIntent({
    ...body,
    source: "api",
  });
}
