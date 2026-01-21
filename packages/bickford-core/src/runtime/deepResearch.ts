import crypto from "node:crypto";
import { appendDeepResearchLedger } from "../ledger/deepResearch";

type DeepResearchConfig = {
  enabled?: boolean;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  tools?: Array<{ type: string; [key: string]: unknown }>;
  maxToolCalls?: number;
  background?: boolean;
  store?: boolean;
  promptTemplate?: string;
  timeoutMs?: number;
};

function normalizeIntent(intent: unknown): string {
  if (typeof intent === "string") {
    return intent;
  }
  if (intent && typeof intent === "object") {
    if ("objective" in intent && typeof intent.objective === "string") {
      return intent.objective;
    }
    if ("goal" in intent && typeof intent.goal === "string") {
      return intent.goal;
    }
  }
  return JSON.stringify(intent);
}

function buildPrompt(intentText: string, template?: string) {
  if (!template) {
    return intentText;
  }
  return template.replace(/\{\{\s*intent\s*\}\}/g, intentText);
}

function summarizeTools(tools: DeepResearchConfig["tools"]) {
  if (!tools || tools.length === 0) {
    return [];
  }
  return tools.map((tool) => tool.type);
}

export async function kickoffDeepResearch(
  intent: unknown,
  state: { deepResearch?: DeepResearchConfig } = {},
) {
  const cfg = state.deepResearch;
  if (!cfg?.enabled) {
    return;
  }

  const apiKey = cfg.apiKey || process.env.OPENAI_API_KEY;
  const baseUrl = (cfg.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1")
    .replace(/\/+$/, "");
  const model = cfg.model || "o3-deep-research";
  const tools = cfg.tools ?? [{ type: "web_search_preview" }];
  const background = cfg.background ?? true;
  const intentText = normalizeIntent(intent);

  if (!apiKey) {
    appendDeepResearchLedger({
      id: crypto.randomUUID(),
      intent: intentText,
      model,
      background,
      maxToolCalls: cfg.maxToolCalls,
      tools: summarizeTools(tools),
      requestedAt: new Date().toISOString(),
      error: "Missing OPENAI_API_KEY",
    });
    return;
  }

  const payload: Record<string, unknown> = {
    model,
    input: buildPrompt(intentText, cfg.promptTemplate),
    tools,
    background,
  };

  if (cfg.maxToolCalls !== undefined) {
    payload.max_tool_calls = cfg.maxToolCalls;
  }

  if (cfg.store !== undefined) {
    payload.store = cfg.store;
  }

  const controller = new AbortController();
  const timeoutMs = cfg.timeoutMs ?? 12000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = (await resp.json()) as { id?: string; status?: string };
    const responseId = data?.id;
    const status = data?.status ?? (resp.ok ? "submitted" : "error");

    if (!resp.ok) {
      const message = typeof data === "object" ? JSON.stringify(data) : "Request failed";
      appendDeepResearchLedger({
        id: crypto.randomUUID(),
        intent: intentText,
        model,
        responseId,
        status,
        background,
        maxToolCalls: cfg.maxToolCalls,
        tools: summarizeTools(tools),
        requestedAt: new Date().toISOString(),
        error: message,
      });
      return;
    }

    appendDeepResearchLedger({
      id: crypto.randomUUID(),
      intent: intentText,
      model,
      responseId,
      status,
      background,
      maxToolCalls: cfg.maxToolCalls,
      tools: summarizeTools(tools),
      requestedAt: new Date().toISOString(),
    });
  } catch (error) {
    appendDeepResearchLedger({
      id: crypto.randomUUID(),
      intent: intentText,
      model,
      background,
      maxToolCalls: cfg.maxToolCalls,
      tools: summarizeTools(tools),
      requestedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timeout);
  }
}
