export function ExecutionEnvelopePanel({ envelope }: any) {
  return (
    <section>
      <h2>Execution Mode</h2>
      <strong>{envelope.mode}</strong>
      <div>Since: {new Date(envelope.since).toLocaleString()}</div>
    </section>
  );
}
