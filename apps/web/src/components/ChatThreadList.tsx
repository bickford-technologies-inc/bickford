"use client";

import { useState, useEffect } from "react";

interface ChatThread {
  id: string;
  createdAt: string;
  lastReplayedAt: string | null;
}

export default function ChatThreadList() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real implementation, this would fetch threads from an API
    // For now, we'll leave it as a placeholder
  }, []);

  const handleReplay = async (threadId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/replay?threadId=${threadId}`);
      if (!response.ok) {
        throw new Error("Failed to replay thread");
      }
      const data = await response.json();
      // Update lastReplayedAt in local state
      setThreads(
        threads.map((t) =>
          t.id === threadId
            ? { ...t, lastReplayedAt: data.thread.lastReplayedAt }
            : t
        )
      );
      console.log("Thread replayed:", data);
    } catch (error) {
      console.error("Error replaying thread:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-thread-list">
      <h2>Chat Threads</h2>
      {threads.length === 0 ? (
        <p>No threads available</p>
      ) : (
        <ul>
          {threads.map((thread) => (
            <li key={thread.id} className="thread-item">
              <div>
                <strong>Thread {thread.id}</strong>
                <br />
                <small>Created: {new Date(thread.createdAt).toLocaleString()}</small>
                {thread.lastReplayedAt && (
                  <>
                    <br />
                    <small>
                      Last Replayed: {new Date(thread.lastReplayedAt).toLocaleString()}
                    </small>
                  </>
                )}
              </div>
              <button
                onClick={() => handleReplay(thread.id)}
                disabled={loading}
                className="replay-button"
              >
                {loading ? "Replaying..." : "Replay"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
