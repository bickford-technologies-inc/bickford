import { allRules } from "@/lib/bickford/ui-data";
import { all as history } from "@/lib/bickford/ui-data";

export default function DiffPage() {
  const rules = allRules();
  const entries = history();

  return (
    <main style={{ padding: 48, maxWidth: 900 }}>
      <h1>Claude → Rule Diff Viewer</h1>

      <p>
        This view shows how advisory Claude reasoning becomes immutable rules
        only after structural enforcement.
      </p>

      <h2>Recent History Entries</h2>
      <pre>{JSON.stringify(entries.slice(-5), null, 2)}</pre>

      <h2>Rules</h2>
      <pre>{JSON.stringify(rules, null, 2)}</pre>
    </main>
  );
}
