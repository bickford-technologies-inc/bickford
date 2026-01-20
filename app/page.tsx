export default function Page() {
  return (
    <div className="bickfordApp">
      <header className="bickfordTopbar">
        <div className="bickfordTopRight">Bickford</div>
      </header>
      <main className="bickfordMain">
        <section className="bickfordPanel">
          <div className="bickfordPanelHeader">
            <h2>Intents</h2>
            <span className="bickfordTag">Live</span>
          </div>
          <p className="bickfordPanelBody">
            Capture and prioritize intents across the environment. Every intent
            becomes the anchor for execution planning.
          </p>
          <ul className="bickfordPanelList">
            <li>Track intent owners and timestamps.</li>
            <li>Surface dependencies before execution.</li>
            <li>Coordinate updates with the unified agent.</li>
          </ul>
        </section>

        <section className="bickfordPanel">
          <div className="bickfordPanelHeader">
            <h2>Code Reviews</h2>
            <span className="bickfordTag">Realization</span>
          </div>
          <p className="bickfordPanelBody">
            Code reviews are focused on the realization of each intent, ensuring
            execution aligns with the stated outcome.
          </p>
          <ul className="bickfordPanelList">
            <li>Intent-to-commit traceability.</li>
            <li>Approval flow tied to intent goals.</li>
            <li>Execution risks highlighted.</li>
          </ul>
        </section>

        <section className="bickfordPanel">
          <div className="bickfordPanelHeader">
            <h2>Archive</h2>
            <span className="bickfordTag">Live Repo</span>
          </div>
          <p className="bickfordPanelBody">
            The archive is the real repository, updated in real time as intents
            are realized and verified.
          </p>
          <ul className="bickfordPanelList">
            <li>Streaming commit history.</li>
            <li>Verified execution artifacts.</li>
            <li>Persistent knowledge retention.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
