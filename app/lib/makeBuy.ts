type MakeBuySignal = {
  phrase: string;
  weight: number;
  tag: string;
};

export type MakeBuyDecision = {
  value: "make" | "buy";
  score: number;
  signals: string[];
};

const MAKE_SIGNALS: MakeBuySignal[] = [
  { phrase: "build", weight: 2, tag: "build" },
  { phrase: "custom", weight: 2, tag: "custom" },
  { phrase: "proprietary", weight: 3, tag: "proprietary" },
  { phrase: "differentiator", weight: 3, tag: "differentiator" },
  { phrase: "unique", weight: 2, tag: "unique" },
  { phrase: "ip", weight: 2, tag: "ip" },
  { phrase: "control", weight: 1, tag: "control" },
  { phrase: "latency", weight: 1, tag: "latency" },
  { phrase: "compliance", weight: 2, tag: "compliance" },
  { phrase: "security", weight: 2, tag: "security" },
  { phrase: "integration", weight: 1, tag: "integration" },
];

const BUY_SIGNALS: MakeBuySignal[] = [
  { phrase: "buy", weight: 2, tag: "buy" },
  { phrase: "purchase", weight: 2, tag: "purchase" },
  { phrase: "vendor", weight: 2, tag: "vendor" },
  { phrase: "saas", weight: 2, tag: "saas" },
  { phrase: "off the shelf", weight: 3, tag: "off-the-shelf" },
  { phrase: "outsource", weight: 2, tag: "outsource" },
  { phrase: "partner", weight: 1, tag: "partner" },
  { phrase: "license", weight: 2, tag: "license" },
  { phrase: "subscription", weight: 1, tag: "subscription" },
  { phrase: "time to market", weight: 2, tag: "time-to-market" },
  { phrase: "faster", weight: 1, tag: "faster" },
];

function scoreSignals(intent: string, signals: MakeBuySignal[]) {
  const matches: string[] = [];
  const total = signals.reduce((acc, signal) => {
    if (intent.includes(signal.phrase)) {
      matches.push(signal.tag);
      return acc + signal.weight;
    }
    return acc;
  }, 0);
  return { total, matches };
}

export function runMakeBuyEngine(intent: string): MakeBuyDecision {
  const normalized = intent.toLowerCase();
  const makeScore = scoreSignals(normalized, MAKE_SIGNALS);
  const buyScore = scoreSignals(normalized, BUY_SIGNALS);
  const score = makeScore.total - buyScore.total;

  if (score > 0) {
    return {
      value: "make",
      score,
      signals: [...makeScore.matches, ...buyScore.matches],
    };
  }

  if (score < 0) {
    return {
      value: "buy",
      score,
      signals: [...makeScore.matches, ...buyScore.matches],
    };
  }

  if (normalized.includes("build") || normalized.includes("custom")) {
    return {
      value: "make",
      score,
      signals: [...makeScore.matches, ...buyScore.matches],
    };
  }

  return {
    value: "buy",
    score,
    signals: [...makeScore.matches, ...buyScore.matches],
  };
}
