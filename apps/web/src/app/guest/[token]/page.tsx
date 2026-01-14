import { allRules } from "@/lib/bickford/ui-data";
import { all as history } from "@/lib/bickford/ui-data";

export default function GuestPage({ params }: { params: { token: string } }) {
  // token is intentionally NOT validated here (read-only demo)
  return (
    <main style={{ padding: 48 }}>
      <h1>Bickford — Guest View</h1>
      <p>Read-only inspection access.</p>

      <h2>Rules</h2>
      <pre>{JSON.stringify(allRules(), null, 2)}</pre>

      <h2>History</h2>
      <pre>{JSON.stringify(history(), null, 2)}</pre>
    </main>
  );
}

// Canonical domain removed: UI surface only
