import { ExecutionAuthority, Intent } from "../core/ExecutionAuthority";
import { ConstitutionalEnforcer } from "../core/ConstitutionalEnforcer";
import { Ledger } from "../ledger/ledger";

const enforcer = new ConstitutionalEnforcer();
const ledger = new Ledger();
const authority = new ExecutionAuthority(enforcer, ledger);

// Bun-native HTTP server
Bun.serve({
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  async fetch(req) {
    if (req.method === "POST" && new URL(req.url).pathname === "/api/chat") {
      const body = await req.json();
      const prompt = body.prompt;
      const context = body.context || {};
      const intent: Intent = {
        id: crypto.randomUUID(),
        prompt,
        context,
        timestamp: Date.now(),
      };
      const decision = await authority.execute(intent);
      return new Response(
        JSON.stringify({
          allowed: decision.allowed,
          reasoning: decision.reasoning,
          violatedConstraints: decision.violatedConstraints,
          proofChain: decision.proofChain,
          metrics: authority.getMetrics(),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    if (req.method === "GET" && new URL(req.url).pathname === "/api/metrics") {
      return new Response(JSON.stringify(authority.getMetrics()), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Not found", { status: 404 });
  },
});
