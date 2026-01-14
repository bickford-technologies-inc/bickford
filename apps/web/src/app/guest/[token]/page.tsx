import { allCanon } from "@/lib/bickford/canon";
import { all as ledger } from "@/lib/bickford/ledger";

export default function GuestPage({ params }: { params: { token: string } }) {
  // token is intentionally NOT validated here (read-only demo)
  return (
    <main style={{ padding: 48 }}>
      <h1>Bickford — Guest View</h1>
      <p>Read-only inspection access.</p>

      <h2>Canon</h2>
      <pre>{JSON.stringify(allCanon(), null, 2)}</pre>

      <h2>Ledger</h2>
      <pre>{JSON.stringify(ledger(), null, 2)}</pre>
    </main>
  );
}
