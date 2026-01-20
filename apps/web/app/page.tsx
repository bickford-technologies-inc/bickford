import intents from "../data/intents.cio.json";

type IntentItem = {
  id?: string;
  title?: string;
  repo?: string;
  timestamp?: string;
  delta?: string;
};

const fallbackIntents: IntentItem[] = [
  {
    id: "intent-1",
    title: "Refresh deployment pipeline for bickford-web",
    repo: "bickford/web",
    timestamp: "Today · 09:12",
    delta: "+12 / −2",
  },
  {
    id: "intent-2",
    title: "Sync Decision Tracer view with ledger",
    repo: "bickford/core",
    timestamp: "Yesterday · 18:40",
    delta: "+4 / −0",
  },
  {
    id: "intent-3",
    title: "Audit authority proofs for intent stream",
    repo: "bickford/authority",
    timestamp: "Yesterday · 14:03",
    delta: "+7 / −1",
  },
];

export default function Page() {
  const intentItems: IntentItem[] =
    Array.isArray(intents) && intents.length > 0
      ? intents.slice(0, 6).map((intent: any, index: number) => ({
          id: intent.id ?? `intent-${index}`,
          title: intent.title ?? intent.name ?? "Untitled intent",
          repo: intent.repo ?? intent.repository ?? "bickford/core",
          timestamp:
            intent.timestamp ??
            intent.createdAt ??
            "Today · 10:00",
          delta: intent.delta ?? "+0 / −0",
        }))
      : fallbackIntents;

  return (
    <main className="codexShell">
      <header className="codexTopBar">
        <div className="codexTopBarLeft">Bickford</div>
        <div className="codexTopBarRight">Bickford</div>
      </header>

      <section className="codexLanding">
        <div className="codexInputWrap">
          <input
            className="codexPrimaryInput"
            data-testid="primary-intent-input"
            placeholder="What should we code next?"
          />
          <div className="codexTabs">
            <button className="codexTab active">Intents</button>
            <button className="codexTab">Decisions</button>
            <button className="codexTab">Intent Tracer View</button>
          </div>
        </div>

        <div className="codexListLayout">
          <div className="codexList">
            {intentItems.map((intent) => (
              <div key={intent.id ?? intent.title} className="codexListRow">
                <div className="codexListTitle">{intent.title}</div>
                <div className="codexListMeta">
                  <span>{intent.timestamp}</span>
                  <span>·</span>
                  <span>{intent.repo}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="codexStatusCol">
            {intentItems.map((intent) => (
              <div key={`${intent.id}-delta`} className="codexDelta">
                {intent.delta}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
