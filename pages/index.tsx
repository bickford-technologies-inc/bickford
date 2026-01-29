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
      <h2>Compliance Demo Reports</h2>
      <ul>
        <li>
          <Link href="/compliance/soc2">SOC-2 Type II Compliance Report</Link>
        </li>
        <li>
          <Link href="/compliance/iso27001">ISO 27001 Compliance Report</Link>
        </li>
        <li>
          <Link href="/compliance/cost-avoidance">Cost Avoidance Summary</Link>
        </li>
        <li>
          <Link href="/compliance/key-benefits">Key Benefits</Link>
        </li>
      </ul>
      <h2>Customer Workflows Demo</h2>
      <ul>
        <li>
          <Link href="/customer-workflows">Customer Workflows Package</Link>
        </li>
      </ul>
      <h2>Compression Demo</h2>
      <ul>
        <li>
          <Link href="/compression/result">Compression Result Example</Link>
        </li>
      </ul>
    </div>
  );
}
