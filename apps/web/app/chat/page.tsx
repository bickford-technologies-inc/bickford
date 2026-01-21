const projects = [
  "Launch readiness",
  "Ledger reconciliation",
  "Authority proofs",
  "Deployment gating",
];

export default function ChatPage() {
  return (
    <main className="chatShell">
      <header className="chatHeader">
        <div className="chatLogo">bickford</div>
      </header>
      <section className="chatLayout">
        <aside className="chatSidebar">
          <div className="chatSidebarTitle">Projects</div>
          <ul className="chatProjectList">
            {projects.map((project) => (
              <li key={project} className="chatProjectItem">
                {project}
              </li>
            ))}
          </ul>
        </aside>
        <div className="chatMain">
          <div className="chatInputWrap">
            <input
              className="chatInput"
              placeholder="Ask bickford"
              aria-label="Ask bickford"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
