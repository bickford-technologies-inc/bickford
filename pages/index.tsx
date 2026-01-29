import Link from "next/link";

export default function Home() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 48 }}>
      <h1>Bickford Ledger Platform</h1>
      <p>Welcome to the Bickford Ledger Platform demo.</p>
      <ul>
        <li>
          <Link href="/ledger">View Ledger Viewer</Link>
        </li>
      </ul>
    </div>
  );
}
