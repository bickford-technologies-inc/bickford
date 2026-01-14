import Link from "next/link";

export default function Page() {
  return (
    <main style={{ padding: 48 }}>
      <h1>Bickford</h1>
      <p>Structural memory. Deterministic execution.</p>
      <ul>
        <li>
          <Link href="/chat">Start an intent</Link>
        </li>
        <li>
          <Link href="/ledger">Live ledger</Link>
        </li>
        <li>
          <Link href="/canon">Canon</Link>
        </li>
        <li>
          <Link href="/optr">OPTR</Link>
        </li>
        <li>
          <Link href="/data-room">Anthropic Data Room</Link>
        </li>
      </ul>
    </main>
  );
}
