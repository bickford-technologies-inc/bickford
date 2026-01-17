export function SlowdownReasonPanel({ envelope }: any) {
  if (envelope.mode === "MAX") return null;
  return (
    <section style={{ color: "red" }}>
      <h3>Execution Reduced</h3>
      <p>{envelope.reason}</p>
    </section>
  );
}
