import React from "react";
import Link from "next/link";

export default function CustomerWorkflowsIndex() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Bickford Customer Workflows Package</h1>
      <ul>
        <li>
          <Link href="/customer-workflows/summary">Package Summary</Link>
        </li>
        <li>
          <Link href="/customer-workflows/executive-summary">
            Executive Summary
          </Link>
        </li>
        <li>
          <Link href="/customer-workflows/diagrams">Workflow Diagrams</Link>
        </li>
        <li>
          <Link href="/customer-workflows/full-workflows">
            Full Workflows & Value
          </Link>
        </li>
        <li>
          <Link href="/customer-workflows/pitch-script">Pitch Script</Link>
        </li>
      </ul>
    </div>
  );
}
