export const runtime = "nodejs";

const SUPPORTED_FORMATS = new Map([
  ["mp3", "audio/mpeg"],
  ["opus", "audio/opus"],
  ["aac", "audio/aac"],
  ["flac", "audio/flac"],
  ["wav", "audio/wav"],
  ["pcm", "audio/pcm"],
]);

type TtsRequest = {
  input?: string;
  voice?: string;
  voiceId?: string;
  format?: string;
  instructions?: string;
  model?: string;
  language?: string;
};

export async function POST(req: Request) {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const body = (await req.json()) as TtsRequest;
  const input = body.input?.trim();
  if (!input) {
    return Response.json(
      { error: "input is required." },
      { status: 400 },
    );
  }

  const format = body.format?.trim() || "mp3";
  const contentType = SUPPORTED_FORMATS.get(format);
  if (!contentType) {
    return Response.json(
      { error: `format must be one of: ${[...SUPPORTED_FORMATS.keys()].join(", ")}.` },
      { status: 400 },
    );
  }

  const model = body.model?.trim() || "gpt-4o-mini-tts";
  const voice = body.voice?.trim() || "marin";
  const voiceId = body.voiceId?.trim();
  const instructions = body.instructions?.trim();
  const language = body.language?.trim();
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/+$/,
    "",
  );

  const voicePayload = voiceId ? { id: voiceId } : voice;

  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input,
      voice: voicePayload,
      response_format: format,
      ...(instructions ? { instructions } : {}),
      ...(language ? { language } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return Response.json(
      { error: `OpenAI TTS error: ${response.status} ${response.statusText}`, details: errorText },
      { status: response.status },
    );
  }

  const audioBuffer = await response.arrayBuffer();
  return new Response(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename=tts.${format}`,
      "X-Bickford-TTS-Voice": voice,
      ...(voiceId ? { "X-Bickford-TTS-Voice-Id": voiceId } : {}),
      "X-Bickford-TTS-Model": model,
    },
  });
}
