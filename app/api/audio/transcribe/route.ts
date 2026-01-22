import crypto from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { appendDailyArchive } from "../../../lib/archive";
import { ENVIRONMENT_AGENT } from "../../../lib/agent";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

type PerformancePeakEntry = {
  value: number;
  traceId: string;
  receivedAt: string;
};

type PerformancePeaks = {
  charsPerSecond: PerformancePeakEntry | null;
  msPerMb: PerformancePeakEntry | null;
};

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

async function readJsonl(filePath: string) {
  try {
    const content = await readFile(filePath, "utf8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException).code;
    if (errorCode === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function getPerformancePeaks() {
  const archiveDir = path.join(process.cwd(), "trace");
  let files: string[] = [];
  try {
    files = await readdir(archiveDir);
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException).code;
    if (errorCode === "ENOENT") {
      return {
        peaks: { charsPerSecond: null, msPerMb: null } satisfies PerformancePeaks,
        archiveDir,
      };
    }
    throw error;
  }

  const indexFiles = files.filter(
    (file) => file.startsWith("speech-to-text-index-") && file.endsWith(".jsonl"),
  );
  const peaks: PerformancePeaks = { charsPerSecond: null, msPerMb: null };

  for (const file of indexFiles) {
    const entries = await readJsonl(path.join(archiveDir, file));
    for (const entry of entries) {
      const performance = entry?.performance;
      if (typeof performance?.charsPerSecond === "number") {
        if (!peaks.charsPerSecond || performance.charsPerSecond > peaks.charsPerSecond.value) {
          peaks.charsPerSecond = {
            value: performance.charsPerSecond,
            traceId: entry.traceId,
            receivedAt: entry.receivedAt,
          };
        }
      }
      if (typeof performance?.msPerMb === "number") {
        if (!peaks.msPerMb || performance.msPerMb < peaks.msPerMb.value) {
          peaks.msPerMb = {
            value: performance.msPerMb,
            traceId: entry.traceId,
            receivedAt: entry.receivedAt,
          };
        }
      }
    }
  }

  return { peaks, archiveDir };
}

function evaluateMaxPeak(currentValue: number | null, peak: PerformancePeakEntry | null) {
  const isNewPeak = typeof currentValue === "number" && (!peak || currentValue > peak.value);
  return {
    value: currentValue,
    isNewPeak,
    previousPeak: peak?.value ?? null,
    previousTraceId: peak?.traceId ?? null,
  };
}

function evaluateMinPeak(currentValue: number | null, peak: PerformancePeakEntry | null) {
  const isNewPeak = typeof currentValue === "number" && (!peak || currentValue < peak.value);
  return {
    value: currentValue,
    isNewPeak,
    previousPeak: peak?.value ?? null,
    previousTraceId: peak?.traceId ?? null,
  };
}

export async function POST(request: Request) {
  const traceId = crypto.randomUUID();
  const startedAt = Date.now();
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

  const fileBuffer = await file.arrayBuffer();
  const fileHashSha256 = crypto.createHash("sha256").update(new Uint8Array(fileBuffer)).digest("hex");

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

  const configuration = {
    operation,
    model,
    response_format: responseFormat ?? "json",
    language,
    prompt: prompt
      ? {
          length: prompt.length,
          sha256: crypto.createHash("sha256").update(prompt).digest("hex"),
          preview: prompt.slice(0, 120),
        }
      : null,
    chunking_strategy: chunkingStrategy,
    timestamp_granularities: timestampGranularities,
    known_speaker_names: knownSpeakerNames,
    known_speaker_references:
      knownSpeakerReferences.length > 0
        ? {
            count: knownSpeakerReferences.length,
            sha256: crypto
              .createHash("sha256")
              .update(knownSpeakerReferences.join("|"))
              .digest("hex"),
          }
        : null,
  };
  const configurationFingerprint = crypto
    .createHash("sha256")
    .update(JSON.stringify(configuration))
    .digest("hex");

  const transcriptText =
    typeof responseBody === "string" ? responseBody : (responseBody as { text?: string })?.text;
  const transcriptChars = transcriptText ? String(transcriptText).length : 0;
  const transcriptWords = transcriptText ? String(transcriptText).trim().split(/\s+/).filter(Boolean).length : 0;
  const transcriptPreview = transcriptText ? String(transcriptText).slice(0, 200) : null;
  const diarizedSegments = Array.isArray((responseBody as { segments?: unknown })?.segments)
    ? (responseBody as { segments: Array<{ speaker?: string }> }).segments
    : null;
  const diarizedSpeakers = diarizedSegments
    ? Array.from(new Set(diarizedSegments.map((segment) => segment.speaker).filter(Boolean)))
    : [];
  const durationMs = Date.now() - startedAt;
  const audioBytes = file.size;
  const audioMb = audioBytes / (1024 * 1024);
  const durationSeconds = durationMs / 1000;
  const charsPerSecond = durationSeconds > 0 ? transcriptChars / durationSeconds : null;
  const msPerMb = audioMb > 0 ? durationMs / audioMb : null;
  const { peaks, archiveDir } = await getPerformancePeaks();
  const performancePeaks = {
    charsPerSecond: evaluateMaxPeak(charsPerSecond, peaks.charsPerSecond),
    msPerMb: evaluateMinPeak(msPerMb, peaks.msPerMb),
  };
  const knowledge = {
    transcriptChars,
    transcriptWords,
    transcriptPreview,
    segmentCount: diarizedSegments ? diarizedSegments.length : null,
    speakerCount: diarizedSpeakers.length > 0 ? diarizedSpeakers.length : null,
  };

  const now = new Date();
  const archiveEntry = {
    agent: ENVIRONMENT_AGENT,
    receivedAt: now.toISOString(),
    traceId,
    durationMs,
    operation,
    model,
    response_format: responseFormat ?? "json",
    language,
    file: {
      name: file.name,
      type: file.type,
      size: file.size,
      sha256: fileHashSha256,
    },
    configuration,
    configurationFingerprint,
    performance: {
      audioBytes,
      audioMb,
      transcriptChars,
      charsPerSecond,
      msPerMb,
      peaks: performancePeaks,
    },
    knowledge,
    transcriptText,
    upstreamStatus: response.status,
    ok: response.ok,
    response: response.ok ? responseBody : undefined,
    error: response.ok ? undefined : responseBody,
  };

  await appendDailyArchive("speech-to-text", archiveEntry);
  await appendDailyArchive("speech-to-text-knowledge", {
    traceId,
    receivedAt: archiveEntry.receivedAt,
    operation,
    model,
    response_format: responseFormat ?? "json",
    language,
    knowledge,
    file: archiveEntry.file,
    configurationFingerprint,
  });
  await appendDailyArchive("speech-to-text-config", {
    traceId,
    receivedAt: archiveEntry.receivedAt,
    configuration,
    configurationFingerprint,
    file: archiveEntry.file,
  });
  await appendDailyArchive("speech-to-text-performance", {
    traceId,
    receivedAt: archiveEntry.receivedAt,
    performance: archiveEntry.performance,
    peaks: performancePeaks,
    archiveDir,
    configurationFingerprint,
    file: archiveEntry.file,
  });
  await appendDailyArchive("speech-to-text-index", {
    traceId,
    receivedAt: archiveEntry.receivedAt,
    operation,
    model,
    response_format: responseFormat ?? "json",
    language,
    durationMs: archiveEntry.durationMs,
    upstreamStatus: archiveEntry.upstreamStatus,
    ok: archiveEntry.ok,
    file: {
      name: archiveEntry.file.name,
      type: archiveEntry.file.type,
      size: archiveEntry.file.size,
      sha256: archiveEntry.file.sha256,
    },
    configurationFingerprint,
    performance: archiveEntry.performance,
    knowledge,
    transcriptPreview,
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
