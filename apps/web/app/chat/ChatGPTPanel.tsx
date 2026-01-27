import { appVoice } from "../uiCopy";

export function ChatGPTPanel({
  messages,
  missing,
}: {
  messages: any[];
  missing?: string[];
}) {
  return (
    <section className="chatGptPanel">
      <h2>ChatGPT Panel</h2>
      <div>{appVoice.loading}</div>
      {messages.length === 0 ? (
        <div>{appVoice.empty}</div>
      ) : (
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>{msg.text}</li>
          ))}
        </ul>
      )}
      {missing && missing.length > 0 && <div>{appVoice.missing(missing)}</div>}
    </section>
  );
}
