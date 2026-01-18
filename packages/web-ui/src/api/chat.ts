import { BACKEND_URL } from "../config";

export async function sendChat(message: string) {
  const res = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("Chat request failed");
  }

  return res.json();
}
