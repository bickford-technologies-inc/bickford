import React from "react";

const content = `# WORKFLOW_DIAGRAMS.md\n\n[All ASCII art workflow diagrams, side-by-side value tables, two-layer architecture, cryptographic proof chain, value creation timeline, and integration visuals.]\n\n---\n\n## Table of Contents\n\n1. Before/After Workflow Diagrams\n2. Side-by-Side Value Comparison Table\n3. Two-Layer Architecture Diagram\n4. Cryptographic Proof Chain Visualization\n5. Value Creation Timeline\n6. Integration Workflow\n\n---\n\n[Insert all diagrams and tables from your prompt, formatted for copy-paste and screen sharing.]\n\n---\n\n_Use these diagrams in presentations, demos, and documentation._`;

export default function CustomerWorkflowDiagrams() {
  return (
    <div
      style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", padding: 24 }}
    >
      <h1>Workflow Diagrams</h1>
      <pre>{content}</pre>
    </div>
  );
}
