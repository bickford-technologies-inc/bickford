"use client";

interface CanonEntry {
  id: string;
  kind: string;
  title: string;
}

interface Intent {
  id: string;
  intentType: string;
  goal: string;
  admissibility: string;
  denialReason: string | null;
}

interface ChatMessageProps {
  id: string;
  author: string;
  text: string;
  resolution: string;
  createdAt: string;
  intent: Intent | null;
  canonEntry: CanonEntry | null;
}

export default function ChatMessageView({
  id,
  author,
  text,
  resolution,
  createdAt,
  intent,
  canonEntry,
}: ChatMessageProps) {
  return (
    <div className={`chat-message ${author.toLowerCase()}`}>
      <div className="message-header">
        <strong>{author}</strong>
        <small>{new Date(createdAt).toLocaleString()}</small>
      </div>
      <div className="message-content">
        <p>{text}</p>
      </div>
      <div className="message-meta">
        <span className={`resolution-badge ${resolution.toLowerCase()}`}>
          {resolution}
        </span>
        {intent && (
          <span className="intent-badge" title={`Intent: ${intent.goal}`}>
            Intent: {intent.intentType}
          </span>
        )}
        {canonEntry && (
          <span className="canon-badge" title={`Canon Entry: ${canonEntry.title}`}>
            📚 Canon: {canonEntry.kind}
          </span>
        )}
      </div>
    </div>
  );
}
