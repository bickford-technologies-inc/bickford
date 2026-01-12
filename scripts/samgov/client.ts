export type SamGovClientOptions = {
  apiKey: string;
  baseUrl?: string; // default: https://api.sam.gov/prod
  timeoutMs?: number; // default: 20s
};

export class SamGovError extends Error {
  status?: number;
  url?: string;
  bodyText?: string;
  constructor(message: string, opts?: { status?: number; url?: string; bodyText?: string }) {
    super(message);
    this.name = "SamGovError";
    this.status = opts?.status;
    this.url = opts?.url;
    this.bodyText = opts?.bodyText;
  }
}

function withQuery(url: URL, params: Record<string, string | number | undefined>) {
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }
}

export async function samgovGetJson<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  opts: SamGovClientOptions
): Promise<T> {
  const base = (opts.baseUrl ?? "https://api.sam.gov/prod").replace(/\/$/, "");
  const url = new URL(base + path);

  // SAM.gov APIs commonly accept api_key as a query param.
  withQuery(url, { ...params, api_key: opts.apiKey });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20_000);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timeout);
    throw new SamGovError(`SAM.gov request failed: ${e?.message ?? String(e)}`, { url: url.toString() });
  }

  clearTimeout(timeout);

  const text = await res.text();
  if (!res.ok) {
    // Never echo the api key; it’s in the URL.
    throw new SamGovError(
      `SAM.gov HTTP ${res.status}: ${text.slice(0, 800)}`,
      { status: res.status, url: url.origin + url.pathname + "?…", bodyText: text }
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new SamGovError(`SAM.gov returned non-JSON response: ${text.slice(0, 800)}`, {
      status: res.status,
      url: url.origin + url.pathname + "?…",
    });
  }
}

export function requireSamGovApiKey(): string {
  const direct = process.env.SAMGOV_API_KEY;
  if (direct && direct.trim().length > 0) return direct.trim();

  const keyPath = process.env.SAMGOV_API_KEY_PATH;
  if (keyPath && keyPath.trim().length > 0) {
    try {
      // Intentionally trims whitespace/newlines.
      // Do not log the key or the file contents.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require("node:fs") as typeof import("node:fs");
      const key = fs.readFileSync(keyPath, "utf8").trim();
      if (key.length > 0) return key;
    } catch {
      throw new SamGovError(
        "SAMGOV_API_KEY_PATH is set but could not be read. Ensure the file exists and is readable."
      );
    }
  }

  throw new SamGovError(
    "Missing SAMGOV_API_KEY. Set SAMGOV_API_KEY or SAMGOV_API_KEY_PATH (do not commit secrets)."
  );
}
