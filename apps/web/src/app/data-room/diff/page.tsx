import { allCanon } from "@/lib/bickford/canon";
import { all as ledger } from "@/lib/bickford/ledger";

export default function DiffPage() {
  const canon = allCanon();
  const led = ledger();

  return (
    <main style={{ padding: 48, maxWidth: 900 }}>
      <h1>Claude → Canon Diff Viewer</h1>

      <p>
        This view shows how advisory Claude reasoning becomes immutable canon
        only after structural enforcement.
      </p>

      <h2>Recent Ledger Entries</h2>
      <pre>{JSON.stringify(led.slice(-5), null, 2)}</pre>

      <h2>Canon Rules</h2>
      <pre>{JSON.stringify(canon, null, 2)}</pre>
    </main>
  );
}
