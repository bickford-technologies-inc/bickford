import { appendLedger } from "@bickford/superconductor-ledger";
import type { LedgerEntry } from "@bickford/types";

export type SoraVideoStatus = "queued" | "in_progress" | "completed" | "failed";
export type SoraVideoModel = "sora-2" | "sora-2-pro";

export type SoraInputReference = {
  data: Uint8Array | ArrayBuffer;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  fileName: string;
};

export type SoraVideoRequest = {
  model: SoraVideoModel;
  prompt: string;
  seconds?: string;
  size?: string;
  remixVideoId?: string;
  inputReference?: SoraInputReference;
};

export type SoraVideoJob = {
  id: string;
  status: SoraVideoStatus;
  model: SoraVideoModel;
  progress?: number;
  seconds?: string;
  size?: string;
  createdAt?: number;
};

export type SoraContentVariant = "video" | "thumbnail" | "spritesheet";

export type SoraListParams = {
  limit?: number;
  after?: string;
  order?: "asc" | "desc";
};

export type SoraListResponse = {
  data: SoraVideoJob[];
  has_more?: boolean;
  object?: string;
};

export type SoraLedgerPayload = {
  videoId: string;
  status: SoraVideoStatus;
  model: SoraVideoModel;
  seconds?: string;
  size?: string;
  prompt?: string;
  remixVideoId?: string;
  storageUri?: string;
  thumbnailUri?: string;
  spritesheetUri?: string;
  performance?: SoraPerformanceMetrics;
  performanceScore?: number;
};

export type SoraLedgerEntry = LedgerEntry & {
  kind: "VIDEO_RENDER";
  payload: SoraLedgerPayload;
};

export type SoraPerformanceMetrics = {
  clarity: number;
  continuity: number;
  brandFit: number;
  reviewTimeSeconds: number;
  notes?: string;
};

function buildBaseUrl(baseUrl?: string) {
  return (
    baseUrl ||
    process.env.OPENAI_BASE_URL ||
    "https://api.openai.com/v1"
  ).replace(/\/+$/, "");
}

export async function createSoraVideoJob(
  request: SoraVideoRequest,
  options: { apiKey?: string; baseUrl?: string } = {},
): Promise<SoraVideoJob> {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to create a Sora video job.");
  }

  const form = new FormData();
  form.append("prompt", request.prompt);
  form.append("model", request.model);
  if (request.seconds) form.append("seconds", request.seconds);
  if (request.size) form.append("size", request.size);
  if (request.remixVideoId) form.append("remix_video_id", request.remixVideoId);

  if (request.inputReference) {
    const data =
      request.inputReference.data instanceof Uint8Array
        ? request.inputReference.data
        : new Uint8Array(request.inputReference.data);
    const blob = new Blob([data as BlobPart], {
      type: request.inputReference.mimeType,
    });
    form.append("input_reference", blob, request.inputReference.fileName);
  }

  const response = await fetch(`${buildBaseUrl(options.baseUrl)}/videos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sora create failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as Record<string, any>;
  return {
    id: payload.id,
    status: payload.status,
    model: payload.model,
    progress: payload.progress ?? undefined,
    seconds: payload.seconds ?? undefined,
    size: payload.size ?? undefined,
    createdAt: payload.created_at ?? undefined,
  };
}

export async function retrieveSoraVideoJob(
  videoId: string,
  options: { apiKey?: string; baseUrl?: string } = {},
): Promise<SoraVideoJob> {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to retrieve a Sora video job.");
  }

  const response = await fetch(
    `${buildBaseUrl(options.baseUrl)}/videos/${videoId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sora retrieve failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as Record<string, any>;
  return {
    id: payload.id,
    status: payload.status,
    model: payload.model,
    progress: payload.progress ?? undefined,
    seconds: payload.seconds ?? undefined,
    size: payload.size ?? undefined,
    createdAt: payload.created_at ?? undefined,
  };
}

export async function createSoraVideoJobAndPoll(
  request: SoraVideoRequest,
  options: {
    apiKey?: string;
    baseUrl?: string;
    pollIntervalMs?: number;
    maxAttempts?: number;
  } = {},
): Promise<SoraVideoJob> {
  const job = await createSoraVideoJob(request, options);
  const pollInterval = options.pollIntervalMs ?? 5000;
  const maxAttempts = options.maxAttempts ?? 120;
  let attempts = 0;
  let current = job;

  while (current.status === "queued" || current.status === "in_progress") {
    if (attempts >= maxAttempts) {
      return current;
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    current = await retrieveSoraVideoJob(current.id, options);
    attempts += 1;
  }

  return current;
}

export async function downloadSoraContent(
  videoId: string,
  options: {
    apiKey?: string;
    baseUrl?: string;
    variant?: SoraContentVariant;
  } = {},
): Promise<ArrayBuffer> {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to download Sora content.");
  }

  const params = new URLSearchParams();
  if (options.variant && options.variant !== "video") {
    params.set("variant", options.variant);
  }
  const query = params.toString();
  const url = `${buildBaseUrl(options.baseUrl)}/videos/${videoId}/content${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sora download failed: ${response.status} ${body}`);
  }

  return response.arrayBuffer();
}

export async function listSoraVideos(
  params: SoraListParams = {},
  options: { apiKey?: string; baseUrl?: string } = {},
): Promise<SoraListResponse> {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to list Sora videos.");
  }

  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.after) query.set("after", params.after);
  if (params.order) query.set("order", params.order);

  const response = await fetch(
    `${buildBaseUrl(options.baseUrl)}/videos?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sora list failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as Record<string, any>;
  return {
    data: (payload.data || []).map((item: any) => ({
      id: item.id,
      status: item.status,
      model: item.model,
      progress: item.progress ?? undefined,
      seconds: item.seconds ?? undefined,
      size: item.size ?? undefined,
      createdAt: item.created_at ?? undefined,
    })),
    has_more: payload.has_more ?? undefined,
    object: payload.object ?? undefined,
  };
}

export async function deleteSoraVideo(
  videoId: string,
  options: { apiKey?: string; baseUrl?: string } = {},
): Promise<void> {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to delete a Sora video.");
  }

  const response = await fetch(
    `${buildBaseUrl(options.baseUrl)}/videos/${videoId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sora delete failed: ${response.status} ${body}`);
  }
}

export function scoreSoraPerformance(metrics: SoraPerformanceMetrics): number {
  const weights = {
    clarity: 0.3,
    continuity: 0.3,
    brandFit: 0.3,
    reviewTimeSeconds: -0.1,
  };

  const normalizedReview = metrics.reviewTimeSeconds / 60;
  const score =
    metrics.clarity * weights.clarity +
    metrics.continuity * weights.continuity +
    metrics.brandFit * weights.brandFit +
    normalizedReview * weights.reviewTimeSeconds;

  return Math.max(0, Number(score.toFixed(3)));
}

export function attachPerformanceMetrics(
  payload: SoraLedgerPayload,
  metrics: SoraPerformanceMetrics,
): SoraLedgerPayload {
  return {
    ...payload,
    performance: metrics,
    performanceScore: scoreSoraPerformance(metrics),
  };
}

export function buildSoraLedgerEntry(
  payload: SoraLedgerPayload,
): SoraLedgerEntry {
  const ts = new Date().toISOString();
  return {
    id: `sora_${payload.videoId}_${Date.now()}`,
    event: {
      id: payload.videoId,
      timestamp: ts,
    },
    kind: "VIDEO_RENDER",
    payload,
  };
}

export function recordSoraVideoEvent(
  threadId: string,
  payload: SoraLedgerPayload,
): SoraLedgerEntry {
  const entry = buildSoraLedgerEntry(payload);
  appendLedger(threadId, entry as LedgerEntry);
  return entry;
}
