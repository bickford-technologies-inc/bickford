// Bun-native email sender (placeholder)
// Replace with actual implementation (e.g., SMTP, Resend, Mailgun, etc.)

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  // TODO: Implement actual email sending logic
  console.log("[sendEmail] To:", to);
  console.log("[sendEmail] Subject:", subject);
  console.log("[sendEmail] Body:", body);
  // For production, integrate with a real email API
}
