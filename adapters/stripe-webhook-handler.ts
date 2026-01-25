// Stripe Webhook Handler - Adapter Layer (compliant)
import { appendToLedger } from "../ledger/appendToLedger";
import { sendEmail } from "../lib/sendEmail";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function handleStripeWebhook(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err instanceof Error ? err.message : "Unknown"}`, { status: 400 });
  }

  // Log to ledger
  await appendToLedger({
    eventType: "stripe_payment",
    payload: event,
    metadata: { receivedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
  });

  // Handle payment success
  if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
    const session = event.data.object as any;
    const email = session.customer_email || session.customer_details?.email;
    const product = session.metadata?.product || session.display_items?.[0]?.custom?.name || session.line_items?.[0]?.description;

    if (product === "AI Compliance Consulting") {
      await sendEmail({
        to: email,
        subject: "Welcome to Bickford AI Compliance Consulting",
        body: `Thank you for your payment! Please schedule your audit here: [Calendly link]\n\nIf you have any questions, reply to this email.\n\n-Derek Bickford\nFounder, Bickford Technologies`,
      });
    } else if (product === "Bickford Beta Access") {
      await sendEmail({
        to: email,
        subject: "Welcome to Bickford Beta Access",
        body: `Thank you for joining the Bickford Beta! We'll reach out shortly with your onboarding instructions.\n\n-Derek Bickford\nFounder, Bickford Technologies`,
      });
    } else if (product === "Compliance Audit") {
      await sendEmail({
        to: email,
        subject: "Your Bickford Compliance Audit Purchase",
        body: `Thank you for your purchase! Please reply to this email with your audit data or to schedule your audit.\n\n-Derek Bickford\nderek@bickford.tech`,
      });
    }
  }

  return new Response("ok", { status: 200 });
}

// Example usage (Bun server):
// import { serve } from "bun";
// serve({
//   fetch: handleStripeWebhook,
//   port: 3000,
// });
