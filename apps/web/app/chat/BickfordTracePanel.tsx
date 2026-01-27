import { bickfordVoice } from "../uiCopy";

export function BickfordTracePanel({
  trace,
  status,
}: {
  trace: any;
  status: string;
}) {
  return (
    <section className="bickfordTracePanel">
      <h2>Bickford Decision Trace Viewer</h2>
      <div>{bickfordVoice.processing}</div>
      <div>{bickfordVoice.verified}</div>
      <div>{bickfordVoice.status(status)}</div>
      <pre>{JSON.stringify(trace, null, 2)}</pre>
      <footer style={{ marginTop: 16, fontWeight: "bold" }}>
        {bickfordVoice.canonicalClosing}
      </footer>
    </section>
  );
}
