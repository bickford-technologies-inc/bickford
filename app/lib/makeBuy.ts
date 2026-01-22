export type MakeBuyValue = "make" | "buy";

type MakeBuySignal = {
  label: string;
  weight: number;
  value: MakeBuyValue;
  keywords: string[];
  tieBreaker?: boolean;
};

export type MakeBuyMatchedSignal = {
  label: string;
  weight: number;
  value: MakeBuyValue;
};

export type MakeBuyDecision = {
  value: MakeBuyValue;
  score: number;
  matchedSignals: MakeBuyMatchedSignal[];
};

const SIGNALS: MakeBuySignal[] = [
  {
    label: "build/custom",
    weight: 4,
    value: "make",
    keywords: ["build", "custom", "bespoke", "from scratch"],
    tieBreaker: true,
  },
  {
    label: "in-house engineering",
    weight: 3,
    value: "make",
    keywords: ["in-house", "internal", "own", "engineering"],
  },
  {
    label: "integrate existing tool",
    weight: 3,
    value: "buy",
    keywords: ["vendor", "saas", "subscription", "license", "third-party"],
  },
  {
    label: "buy off the shelf",
    weight: 4,
    value: "buy",
    keywords: ["off the shelf", "purchase", "procure", "buy"],
  },
  {
    label: "faster to implement",
    weight: 2,
    value: "buy",
    keywords: ["fast", "quick", "immediate", "time to market"],
  },
  {
    label: "control roadmap",
    weight: 2,
    value: "make",
    keywords: ["control", "roadmap", "differentiator", "competitive"],
  },
];

function normalizeIntent(intent: string): string {
  return intent.toLowerCase();
}

function intentMatchesKeyword(normalizedIntent: string, keyword: string): boolean {
  return normalizedIntent.includes(keyword);
}

export function runMakeBuyEngine(intent: string): MakeBuyDecision {
  const normalizedIntent = normalizeIntent(intent);
  const matchedSignals: MakeBuyMatchedSignal[] = [];
  let makeScore = 0;
  let buyScore = 0;
  let hasTieBreakerSignal = false;

  for (const signal of SIGNALS) {
    const matched = signal.keywords.some((keyword) =>
      intentMatchesKeyword(normalizedIntent, keyword),
    );

    if (!matched) continue;

    matchedSignals.push({
      label: signal.label,
      weight: signal.weight,
      value: signal.value,
    });

    if (signal.value === "make") {
      makeScore += signal.weight;
      if (signal.tieBreaker) {
        hasTieBreakerSignal = true;
      }
    } else {
      buyScore += signal.weight;
    }
  }

  let value: MakeBuyValue;
  if (makeScore === buyScore) {
    value = hasTieBreakerSignal ? "make" : "buy";
  } else {
    value = makeScore > buyScore ? "make" : "buy";
  }

  const score = value === "make" ? makeScore : buyScore;

  return {
    value,
    score,
    matchedSignals,
  };
}
