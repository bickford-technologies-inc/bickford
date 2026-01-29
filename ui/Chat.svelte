<script lang="ts">
  let messages: { role: "user" | "assistant"; content: string; allowed?: boolean; reasoning?: string }[] = [];
  let input = "";
  let loading = false;
  async function send() {
    if (!input.trim()) return;
    messages = [...messages, { role: "user", content: input }];
    loading = true;
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });
    const data = await res.json();
    messages = [
      ...messages,
      {
        role: "assistant",
        content: data.allowed
          ? "✅ Allowed: " + data.reasoning
          : "❌ Blocked: " + (data.reasoning || "Violated constraints"),
        allowed: data.allowed,
        reasoning: data.reasoning,
      },
    ];
    input = "";
    loading = false;
  }
</script>

<main>
  <h2>Bickford Conversational Chat</h2>
  <div class="chat-window">
    {#each messages as m}
      <div class="msg {m.role}">
        <b>{m.role === "user" ? "You" : "Bickford"}:</b> {m.content}
      </div>
    {/each}
    {#if loading}
      <div class="msg assistant">Bickford is thinking...</div>
    {/if}
  </div>
  <form on:submit|preventDefault={send}>
    <input bind:value={input} placeholder="Type your message..." autocomplete="off" />
    <button type="submit" disabled={loading}>Send</button>
  </form>
</main>

<style>
main {
  max-width: 500px;
  margin: 2rem auto;
  font-family: sans-serif;
}
.chat-window {
  border: 1px solid #ccc;
  min-height: 200px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fafbfc;
}
.msg {
  margin-bottom: 0.5rem;
}
.msg.user {
  text-align: right;
  color: #333;
}
.msg.assistant {
  text-align: left;
  color: #0a6;
}
form {
  display: flex;
  gap: 0.5rem;
}
input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
}
button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
</style>
