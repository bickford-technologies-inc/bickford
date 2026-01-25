// Monetization workflow: send Stripe payment link via SMS using Twilio
import { sendSms } from "../lib/sendSms";

// Example usage: send a payment link to a prospect
export async function sendMonetizationSms({
  to,
  product,
  paymentLink,
  name,
}: {
  to: string;
  product: string;
  paymentLink: string;
  name?: string;
}) {
  let body = "";
  switch (product) {
    case "AI Compliance Consulting":
      body = `Hi${name ? ` ${name}` : ""},\n\nCan you cryptographically prove your AI followed your policies?\nIf not, you have a compliance gap.\n$5,000. 2-hour audit. This week.\nBook now: ${paymentLink}`;
      break;
    case "Bickford Beta Access":
      body = `Hi${name ? ` ${name}` : ""},\n\nEarly access to Bickford Superconductor (cryptographic AI compliance).\nBeta: $1,000/mo.\nJoin: ${paymentLink}`;
      break;
    case "Compliance Audit":
      body = `Hi${name ? ` ${name}` : ""},\n\nOn-demand compliance audit. $100.\nInstant certificate.\nPay: ${paymentLink}`;
      break;
    default:
      body = `Hi${name ? ` ${name}` : ""},\n\nCheck out Bickford's AI compliance solutions.\n${paymentLink}`;
  }
  await sendSms({ to, body });
}
