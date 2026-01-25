import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaLedger } from '@bickford/ledger';
import { sendOnboardingEmail, notifyAdmin } from '../../../lib/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}` },
      { status: 400 }
    );
  }

  const ledger = new PrismaLedger();
  await ledger.recordDecision({
    id: `stripe-${event.id}`,
    timestamp: new Date(event.created * 1000),
    action: `stripe.${event.type}`,
    constraints: ['payment_processing', 'customer_onboarding'],
    outcome: 'allowed',
    reason: `Stripe webhook event: ${event.type}`,
  });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    await handlePaymentSuccess({
      sessionId: session.id,
      customerId: session.customer as string,
      customerEmail: session.customer_email || session.customer_details?.email || '',
      amountTotal: session.amount_total || 0,
      currency: session.currency || 'usd',
      productName: session.metadata?.product || 'Unknown Product',
      metadata: session.metadata || {},
    });
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(payment: {
  sessionId: string;
  customerId: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  productName: string;
  metadata: Record<string, string>;
}) {
  console.log('Processing payment:', payment);

  switch (payment.productName) {
    case 'AI Compliance Consulting':
      await handleConsultingPurchase(payment);
      break;
    case 'Bickford Beta Access':
      await handleBetaAccessPurchase(payment);
      break;
    case 'Compliance Audit':
      await handleAuditPurchase(payment);
      break;
    default:
      await handleGenericPurchase(payment);
  }

  await notifyAdmin({
    subject: `New Payment: ${payment.productName}`,
    message: `New payment received!
Product: ${payment.productName}
Amount: $${(payment.amountTotal / 100).toFixed(2)} ${payment.currency.toUpperCase()}
Customer: ${payment.customerEmail}
Session: ${payment.sessionId}`,
  });
}

async function handleConsultingPurchase(payment: any) {
  await sendOnboardingEmail({
    to: payment.customerEmail,
    subject: 'Welcome to Bickford AI Compliance Consulting',
    template: 'consulting-onboarding',
    data: {
      customerName: payment.metadata.customer_name || 'there',
      amount: (payment.amountTotal / 100).toFixed(2),
      schedulingLink: 'https://calendly.com/your-link',
      nextSteps: `1. Schedule your 2-hour compliance audit
2. Prepare: List of AI systems and policies
3. We'll review your architecture live
4. You'll receive a detailed report within 24 hours`,
    },
  });
}

async function handleBetaAccessPurchase(payment: any) {
  await sendOnboardingEmail({
    to: payment.customerEmail,
    subject: 'Bickford Beta Access - Setup Instructions',
    template: 'beta-onboarding',
    data: {
      customerName: payment.metadata.customer_name || 'there',
      tier: payment.metadata.tier || 'Startup',
      apiKey: `bk_${Math.random().toString(36).substring(2, 15)}`,
      deploymentGuide: 'https://docs.bickford.tech/deployment',
      nextSteps: `1. Review deployment guide
2. Test with sample data
3. Schedule integration call
4. Go live within 2 weeks`,
    },
  });
}

async function handleAuditPurchase(payment: any) {
  await sendOnboardingEmail({
    to: payment.customerEmail,
    subject: 'Compliance Audit - Upload Your Data',
    template: 'audit-instructions',
    data: {
      customerName: payment.metadata.customer_name || 'there',
      uploadLink: `https://your-domain.com/upload/${payment.sessionId}`,
      nextSteps: `1. Upload your AI decision data (CSV or JSON)
2. We'll process and generate your certificate
3. Results delivered within 24 hours
4. Certificate valid for SOC-2, ISO 27001, HIPAA`,
    },
  });
}

async function handleGenericPurchase(payment: any) {
  await sendOnboardingEmail({
    to: payment.customerEmail,
    subject: 'Payment Received - Thank You!',
    template: 'generic-confirmation',
    data: {
      customerName: payment.metadata.customer_name || 'there',
      productName: payment.productName,
      amount: (payment.amountTotal / 100).toFixed(2),
      nextSteps: 'We will reach out within 24 hours with next steps.',
    },
  });
}
