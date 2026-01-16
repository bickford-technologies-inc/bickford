import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { selectModel } from "@/lib/ai/modelRouter";
import { adapter } from '@/lib/ai/adapter';

export const runtime = "nodejs"; // 🔒 force Node runtime (required)

const RATE_LIMIT = 20; // requests per minute per IP
const rateLimitMap = new Map();

function getIP(req) {
  return req.headers.get("x-forwarded-for") || "unknown";
}

export async function POST(req) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Refusing to start.");
  }

  const ip = getIP(req);
  const now = adapter.now();
  const windowStart = now - 60_000;

  // Clean up old entries
  for (const [key, timestamps] of rateLimitMap.entries()) {
    rateLimitMap.set(key, timestamps.filter((ts) => ts > windowStart));
  }

  const timestamps = rateLimitMap.get(ip) || [];
  if (timestamps.length >= RATE_LIMIT) {
    return new Response("Rate limit exceeded", { status: 429 });
  }
  rateLimitMap.set(ip, [...timestamps, now]);

  const { messages } = await req.json();
  return streamText({
    model: openai(selectModel("chat")),
    messages,
  });
}
