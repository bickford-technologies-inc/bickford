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
          <Link href="/history">Live History</Link>
        </li>
        <li>
          <Link href="/rules">Rules</Link>
        </li>
        <li>
          <Link href="/score">Path Scoring</Link>
        </li>
        <li>
          <Link href="/data-room">Anthropic Data Room</Link>
        </li>
      </ul>
    </main>
  );
}
