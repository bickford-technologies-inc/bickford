"use client";
import dynamic from "next/dynamic";

const ExecutionEnvelopePanel = dynamic(
  () =>
    import("@bickford/bickford-ui/panels/ExecutionEnvelopePanel").then(
      (m) => m.ExecutionEnvelopePanel,
    ),
  { ssr: false },
);
const SlowdownReasonPanel = dynamic(
  () =>
    import("@bickford/bickford-ui/panels/SlowdownReasonPanel").then(
      (m) => m.SlowdownReasonPanel,
    ),
  { ssr: false },
);

export function PlatformPanels({ envelope }: { envelope: any }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2>Execution Envelope</h2>
      <ExecutionEnvelopePanel envelope={envelope} />
      <h2>Slowdown Reason</h2>
      <SlowdownReasonPanel reason={envelope.reason} />
    </section>
  );
}
