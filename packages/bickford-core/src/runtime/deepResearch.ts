import crypto from "node:crypto";
import { appendDeepResearchLedger } from "../ledger/deepResearch";
import { readDeepResearchKnowledge } from "../ledger/deepResearchKnowledge";
import {
  appendDeepResearchPerformance,
  readDeepResearchPerformance,
} from "../ledger/deepResearchPerformance";
import {
  appendDeepResearchConfig,
  readDeepResearchConfig,
} from "../ledger/deepResearchConfig";
import {
  BusinessProcessWorkflow,
  valuePerHourUsd,
} from "../business/processWorkflows";

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
  compoundKnowledge?: boolean;
  compoundConfig?: boolean;
  businessProcessWorkflow?: BusinessProcessWorkflow;
  valuePerHourUsd?: number;
  continuousCompounding?: boolean;
  adaptivePerformance?: {
    enabled?: boolean;
    targetAvgDurationMs?: number;
    maxToolCallsRange?: { min: number; max: number };
    timeoutRangeMs?: { min: number; max: number };
  };
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

function buildPrompt(
  intentText: string,
  template?: string,
  previousSummary?: string,
) {
  if (!template) {
    return previousSummary
      ? `${intentText}\n\nPrevious knowledge:\n${previousSummary}`
      : intentText;
  }
  const base = template.replace(/\{\{\s*intent\s*\}\}/g, intentText);
  return previousSummary ? `${base}\n\nPrevious knowledge:\n${previousSummary}` : base;
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
  const previous = cfg.compoundKnowledge
    ? readDeepResearchKnowledge(intentText)
    : undefined;
  const startedAt = Date.now();
  const priorPerformance = readDeepResearchPerformance(intentText);
  const priorConfig = cfg.compoundConfig
    ? readDeepResearchConfig(intentText)
    : undefined;
  const adaptive = cfg.adaptivePerformance?.enabled ?? false;
  const targetAvgDurationMs = cfg.adaptivePerformance?.targetAvgDurationMs ?? 10000;
  const maxToolCallsRange = cfg.adaptivePerformance?.maxToolCallsRange ?? {
    min: 2,
    max: 12,
  };
  const timeoutRangeMs = cfg.adaptivePerformance?.timeoutRangeMs ?? {
    min: 8000,
    max: 20000,
  };
  let effectiveMaxToolCalls =
    cfg.maxToolCalls ?? priorConfig?.effectiveMaxToolCalls;
  let effectiveTimeoutMs =
    cfg.timeoutMs ?? priorConfig?.effectiveTimeoutMs ?? 12000;
  const workflowId =
    cfg.businessProcessWorkflow?.id ?? priorConfig?.workflowId;
  const workflowName =
    cfg.businessProcessWorkflow?.name ?? priorConfig?.workflowName;
  const continuousCompounding =
    cfg.continuousCompounding ??
    Boolean(
      cfg.compoundKnowledge ||
        cfg.compoundConfig ||
        cfg.adaptivePerformance?.enabled,
    );
  const workflowValuePerHourUsd =
    cfg.valuePerHourUsd ??
    (cfg.businessProcessWorkflow
      ? valuePerHourUsd(cfg.businessProcessWorkflow)
      : priorConfig?.valuePerHourUsd);

  if (adaptive && priorPerformance) {
    if (effectiveMaxToolCalls !== undefined) {
      if (priorPerformance.avgDurationMs > targetAvgDurationMs) {
        effectiveMaxToolCalls = Math.max(
          maxToolCallsRange.min,
          effectiveMaxToolCalls - 1,
        );
      } else if (priorPerformance.avgDurationMs < targetAvgDurationMs * 0.6) {
        effectiveMaxToolCalls = Math.min(
          maxToolCallsRange.max,
          effectiveMaxToolCalls + 1,
        );
      }
    }

    if (priorPerformance.avgDurationMs > effectiveTimeoutMs * 0.9) {
      effectiveTimeoutMs = Math.min(
        timeoutRangeMs.max,
        Math.max(
          timeoutRangeMs.min,
          Math.round(priorPerformance.avgDurationMs * 1.25),
        ),
      );
    } else if (priorPerformance.avgDurationMs < effectiveTimeoutMs * 0.5) {
      effectiveTimeoutMs = Math.max(
        timeoutRangeMs.min,
        Math.round(effectiveTimeoutMs * 0.85),
      );
    }
  }

  if (!apiKey) {
    appendDeepResearchLedger({
      id: crypto.randomUUID(),
      intent: intentText,
      model,
      background,
      maxToolCalls: cfg.maxToolCalls,
      effectiveMaxToolCalls,
      effectiveTimeoutMs,
      valuePerHourUsd: workflowValuePerHourUsd,
      workflowId,
      workflowName,
      continuousCompounding,
      tools: summarizeTools(tools),
      requestedAt: new Date().toISOString(),
      error: "Missing OPENAI_API_KEY",
    });
    appendDeepResearchConfig({
      id: crypto.randomUUID(),
      intent: intentText,
      model,
      tools: summarizeTools(tools),
      effectiveMaxToolCalls,
      effectiveTimeoutMs,
      valuePerHourUsd: workflowValuePerHourUsd,
      workflowId,
      workflowName,
      continuousCompounding,
      background,
      createdAt: new Date().toISOString(),
      reason: "missing_api_key",
    });
    return;
  }

  const payload: Record<string, unknown> = {
    model,
    input: buildPrompt(intentText, cfg.promptTemplate, previous?.summary),
    tools,
    background,
  };

  if (effectiveMaxToolCalls !== undefined) {
    payload.max_tool_calls = effectiveMaxToolCalls;
  }

  if (cfg.store !== undefined) {
    payload.store = cfg.store;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), effectiveTimeoutMs);

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
        effectiveMaxToolCalls,
        effectiveTimeoutMs,
        valuePerHourUsd: workflowValuePerHourUsd,
        workflowId,
        workflowName,
        continuousCompounding,
        tools: summarizeTools(tools),
        requestedAt: new Date().toISOString(),
        error: message,
      });
      appendDeepResearchConfig({
        id: crypto.randomUUID(),
        intent: intentText,
        model,
        tools: summarizeTools(tools),
        effectiveMaxToolCalls,
        effectiveTimeoutMs,
        valuePerHourUsd: workflowValuePerHourUsd,
        workflowId,
        workflowName,
        continuousCompounding,
        background,
        createdAt: new Date().toISOString(),
        reason: "request_failed",
      });
      const durationMs = Date.now() - startedAt;
      const samples = (priorPerformance?.samples ?? 0) + 1;
      const failureCount = (priorPerformance?.failureCount ?? 0) + 1;
      const successCount = priorPerformance?.successCount ?? 0;
      const avgDurationMs = priorPerformance
        ? (priorPerformance.avgDurationMs * (samples - 1) + durationMs) / samples
        : durationMs;
      const bestAvgDurationMs = Math.min(
        priorPerformance?.bestAvgDurationMs ?? avgDurationMs,
        avgDurationMs,
      );
      const bestLastDurationMs = Math.min(
        priorPerformance?.bestLastDurationMs ?? durationMs,
        durationMs,
      );
      appendDeepResearchPerformance({
        id: crypto.randomUUID(),
        intent: intentText,
        samples,
        successCount,
        failureCount,
        avgDurationMs,
        lastDurationMs: durationMs,
        lastStatus: "error",
        bestAvgDurationMs,
        bestLastDurationMs,
        createdAt: new Date().toISOString(),
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
      effectiveMaxToolCalls,
      effectiveTimeoutMs,
      valuePerHourUsd: workflowValuePerHourUsd,
      workflowId,
      workflowName,
      continuousCompounding,
      tools: summarizeTools(tools),
      requestedAt: new Date().toISOString(),
    });
    appendDeepResearchConfig({
      id: crypto.randomUUID(),
      intent: intentText,
      model,
      tools: summarizeTools(tools),
      effectiveMaxToolCalls,
      effectiveTimeoutMs,
      valuePerHourUsd: workflowValuePerHourUsd,
      workflowId,
      workflowName,
      continuousCompounding,
      background,
      createdAt: new Date().toISOString(),
      reason: "submitted",
    });
    const durationMs = Date.now() - startedAt;
    const samples = (priorPerformance?.samples ?? 0) + 1;
    const successCount = (priorPerformance?.successCount ?? 0) + 1;
    const failureCount = priorPerformance?.failureCount ?? 0;
    const avgDurationMs = priorPerformance
      ? (priorPerformance.avgDurationMs * (samples - 1) + durationMs) / samples
      : durationMs;
    const bestAvgDurationMs = Math.min(
      priorPerformance?.bestAvgDurationMs ?? avgDurationMs,
      avgDurationMs,
    );
    const bestLastDurationMs = Math.min(
      priorPerformance?.bestLastDurationMs ?? durationMs,
      durationMs,
    );
    appendDeepResearchPerformance({
      id: crypto.randomUUID(),
      intent: intentText,
      samples,
      successCount,
      failureCount,
      avgDurationMs,
      lastDurationMs: durationMs,
      lastStatus: "success",
      bestAvgDurationMs,
      bestLastDurationMs,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    appendDeepResearchLedger({
      id: crypto.randomUUID(),
      intent: intentText,
      model,
      background,
      maxToolCalls: cfg.maxToolCalls,
      effectiveMaxToolCalls,
      effectiveTimeoutMs,
      valuePerHourUsd: workflowValuePerHourUsd,
      workflowId,
      workflowName,
      continuousCompounding,
      tools: summarizeTools(tools),
      requestedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
    appendDeepResearchConfig({
      id: crypto.randomUUID(),
      intent: intentText,
      model,
      tools: summarizeTools(tools),
      effectiveMaxToolCalls,
      effectiveTimeoutMs,
      valuePerHourUsd: workflowValuePerHourUsd,
      workflowId,
      workflowName,
      continuousCompounding,
      background,
      createdAt: new Date().toISOString(),
      reason: "request_error",
    });
    const durationMs = Date.now() - startedAt;
    const samples = (priorPerformance?.samples ?? 0) + 1;
    const failureCount = (priorPerformance?.failureCount ?? 0) + 1;
    const successCount = priorPerformance?.successCount ?? 0;
    const avgDurationMs = priorPerformance
      ? (priorPerformance.avgDurationMs * (samples - 1) + durationMs) / samples
      : durationMs;
    const bestAvgDurationMs = Math.min(
      priorPerformance?.bestAvgDurationMs ?? avgDurationMs,
      avgDurationMs,
    );
    const bestLastDurationMs = Math.min(
      priorPerformance?.bestLastDurationMs ?? durationMs,
      durationMs,
    );
    appendDeepResearchPerformance({
      id: crypto.randomUUID(),
      intent: intentText,
      samples,
      successCount,
      failureCount,
      avgDurationMs,
      lastDurationMs: durationMs,
      lastStatus: "error",
      bestAvgDurationMs,
      bestLastDurationMs,
      createdAt: new Date().toISOString(),
    });
  } finally {
    clearTimeout(timeout);
  }
}
