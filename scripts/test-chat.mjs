const PORT = Number(process.env.PORT || 3000);
const BASE = process.env.BICKFORD_API_BASE_URL || `http://127.0.0.1:${PORT}`;

async function mustJson(resp) {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch (parseErr) {
    const err = new Error(`Expected JSON, got: ${text.slice(0, 400)}`);
    err.cause = parseErr;
    err.responseText = text;
    throw err;
  }
}

async function main() {
  console.log(`[test:chat] Base: ${BASE}`);

  // 1) Health
  const healthResp = await fetch(`${BASE}/api/health`);
  if (!healthResp.ok) {
    throw new Error(`Health failed: ${healthResp.status} ${healthResp.statusText}`);
  }
  const health = await mustJson(healthResp);
  console.log(`[test:chat] health.status=${health?.status} llm.configured=${health?.llm?.configured} model=${health?.llm?.model}`);

  // 2) Chat
  const chatResp = await fetch(`${BASE}/api/filing/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'hi', mode: 'DEREK', sessionId: 'sess_test', actorId: 'human' })
  });

  const chat = await mustJson(chatResp);
  if (!chatResp.ok || chat?.ok === false) {
    const code = chat?.code || chat?.reason || `HTTP_${chatResp.status}`;
    throw new Error(`Chat failed: ${code}`);
  }

  const reply = chat?.reply ?? chat?.content ?? chat?.message?.content;
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new Error('Chat response missing reply/content');
  }

  console.log('[test:chat] reply:');
  console.log(reply);
  console.log('[test:chat] OK');
}

main().catch((err) => {
  console.error('[test:chat] FAIL');
  console.error(err?.stack || String(err));
  process.exit(1);
});
