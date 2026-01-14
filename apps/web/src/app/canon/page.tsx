import { MOAT_TEXT } from "@/lib/bickford/moat";

export default function CanonPage() {
  return (
    <main style={{ padding: 48 }}>
      <h1>Canon & Compounding Intelligence</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{MOAT_TEXT}</pre>
    </main>
  );
}
