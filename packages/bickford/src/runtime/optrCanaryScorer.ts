import fs from "fs"
import { scoreCanary } from "./canarySLO"

type Signals = {
  marginLatency: number
  marginError: number
  trend: "up" | "flat" | "down"
  volatility: number
  confidence: number
  cooldownActive: boolean
}

const cfg = JSON.parse(
  fs.readFileSync("infra/routing/optr-canary.json", "utf8")
)

export function scoreAction(signals: Signals) {
  if (signals.cooldownActive) return { action: "HOLD", score: -1 }

  let score = 0
  score += Math.max(0, signals.marginLatency) * 0.4
  score += Math.max(0, signals.marginError) * 0.4
  score += (signals.trend === "up" ? 0.2 : signals.trend === "down" ? -0.3 : 0)
  score -= Math.max(0, signals.volatility - cfg.risk.volatility_guard)
  score += Math.min(1, signals.confidence)

  if (score > 0.6) return { action: "ACCELERATE", score }
  if (score < 0.0) return { action: "DECELERATE", score }
  return { action: "HOLD", score }
}
