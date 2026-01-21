import crypto from "node:crypto";

import { appendDailyArchive } from "../../../lib/archive";
import { ENVIRONMENT_AGENT } from "../../../lib/agent";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return null;
}

function getStringArray(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

export async function POST(request: Request) {
  const traceId = crypto.randomUUID();
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY is not configured.", trace_id: traceId }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing audio file.", trace_id: traceId }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "File exceeds 25 MB limit.", trace_id: traceId }, { status: 400 });
  }

  const operation = getString(formData, "operation") ?? "transcriptions";
  if (operation !== "transcriptions" && operation !== "translations") {
    return Response.json(
      { error: "operation must be transcriptions or translations.", trace_id: traceId },
      { status: 400 },
    );
  }

  const stream = getString(formData, "stream");
  if (stream && stream !== "false") {
    return Response.json(
      { error: "Streaming is not supported in this endpoint.", trace_id: traceId },
      { status: 400 },
    );
  }

  const model =
    getString(formData, "model") ?? (operation === "translations" ? "whisper-1" : "gpt-4o-transcribe");
  const responseFormat = getString(formData, "response_format");
  const language = getString(formData, "language");
  const prompt = getString(formData, "prompt");
  const chunkingStrategy = getString(formData, "chunking_strategy");
  const timestampGranularities = [
    ...getStringArray(formData, "timestamp_granularities[]"),
    ...getStringArray(formData, "timestamp_granularities"),
  ];
  const knownSpeakerNames = [
    ...getStringArray(formData, "known_speaker_names[]"),
    ...getStringArray(formData, "known_speaker_names"),
  ];
  const knownSpeakerReferences = [
    ...getStringArray(formData, "known_speaker_references[]"),
    ...getStringArray(formData, "known_speaker_references"),
  ];

  const payload = new FormData();
  payload.append("file", file, file.name);
  payload.append("model", model);
  if (responseFormat) payload.append("response_format", responseFormat);
  if (language) payload.append("language", language);
  if (prompt) payload.append("prompt", prompt);
  if (chunkingStrategy) payload.append("chunking_strategy", chunkingStrategy);
  timestampGranularities.forEach((entry) => payload.append("timestamp_granularities[]", entry));
  knownSpeakerNames.forEach((entry) => payload.append("known_speaker_names[]", entry));
  knownSpeakerReferences.forEach((entry) => payload.append("known_speaker_references[]", entry));

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const apiUrl = `${baseUrl}/audio/${operation}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: payload,
  });

  const contentType = response.headers.get("content-type") || "";
  const responseBody = contentType.includes("application/json") ? await response.json() : await response.text();

  const transcriptText =
    typeof responseBody === "string" ? responseBody : (responseBody as { text?: string })?.text;

  const now = new Date();
  await appendDailyArchive("speech-to-text", {
    agent: ENVIRONMENT_AGENT,
    receivedAt: now.toISOString(),
    traceId,
    operation,
    model,
    response_format: responseFormat ?? "json",
    language,
    file: {
      name: file.name,
      type: file.type,
      size: file.size,
    },
    transcriptText,
    response: response.ok ? responseBody : undefined,
    error: response.ok ? undefined : responseBody,
  });

  const headers = new Headers({ "x-bickford-trace-id": traceId });

  if (!response.ok) {
    return Response.json({ error: responseBody, trace_id: traceId }, { status: response.status, headers });
  }

  if (typeof responseBody === "string") {
    headers.set("content-type", contentType || "text/plain; charset=utf-8");
    return new Response(responseBody, { status: response.status, headers });
  }

  return Response.json(responseBody, { status: response.status, headers });
}
