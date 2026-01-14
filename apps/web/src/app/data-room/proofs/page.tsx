export default function ProofsPage() {
  return (
    <main style={{ padding: 48, maxWidth: 900 }}>
      <h1>Formal Safety & Non-Interference Proofs</h1>

      <h2>Invariant</h2>
      <pre>ΔE[TTV_j | π_i] ≤ 0 for all agents i ≠ j</pre>

      <h2>Enforcement Point</h2>
      <p>
        This invariant is enforced at rule promotion time, not review time, not
        post-hoc, and not probabilistically.
      </p>

      <h2>Why This Matters</h2>
      <ul>
        <li>No agent can displace another from its optimal path</li>
        <li>Multi-agent autonomy is safe by construction</li>
        <li>Violations are rejected, not mitigated</li>
      </ul>

      <p>Claude proposes. Bickford enforces. Rules remembered.</p>
    </main>
  );
}
