import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EXPECTED_WEBHOOK_URL = 'https://energialivre.dev.br/api/stripe/webhook';
const EXPECTED_API_VERSION = '2024-06-20';
const HANDLED_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'charge.refunded',
] as const;

function mask(value: string | undefined, head = 12): string | null {
  if (!value) return null;
  if (value.length <= head) return value;
  return `${value.slice(0, head)}...`;
}

export async function GET(_request: NextRequest) {
  const hasSecret = Boolean(process.env.STRIPE_SECRET_KEY);
  const hasWebhookSecret = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const hasPublishable = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  let stripeValid = false;
  let stripeMode: 'test' | 'live' | 'unknown' = 'unknown';
  let stripeAccountId: string | null = null;
  let stripeError: string | null = null;

  if (hasSecret) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-06-20',
      });
      // Detecta modo pelo prefixo da chave (mais confiável que API call)
      stripeMode = process.env.STRIPE_SECRET_KEY!.startsWith('sk_live_')
        ? 'live'
        : 'test';
      // Valida a chave fazendo um call leve (listará 1 customer, suficiente)
      await stripe.customers.list({ limit: 1 });
      stripeValid = true;
    } catch (err: any) {
      stripeError = err?.message ?? 'unknown error';
    }
  }

  let urlReachable: 'yes' | 'no' | 'unknown' = 'unknown';
  let urlStatus: number | null = null;
  let urlError: string | null = null;
  try {
    const r = await fetch(EXPECTED_WEBHOOK_URL, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    urlStatus = r.status;
    urlReachable = r.ok || r.status === 405 || r.status === 400 ? 'yes' : 'no';
  } catch (err: any) {
    urlReachable = 'no';
    urlError = err?.message ?? 'fetch failed';
  }

  const webhookHealthy =
    hasSecret && hasWebhookSecret && stripeValid && urlReachable === 'yes';

  return NextResponse.json(
    {
      ok: webhookHealthy,
      env: {
        STRIPE_SECRET_KEY_set: hasSecret,
        STRIPE_SECRET_KEY_preview: mask(process.env.STRIPE_SECRET_KEY),
        STRIPE_WEBHOOK_SECRET_set: hasWebhookSecret,
        STRIPE_WEBHOOK_SECRET_preview: mask(process.env.STRIPE_WEBHOOK_SECRET),
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_set: hasPublishable,
      },
      stripe: {
        valid: stripeValid,
        mode: stripeMode,
        account_id: stripeAccountId,
        api_version: EXPECTED_API_VERSION,
        error: stripeError,
      },
      endpoint: {
        url: EXPECTED_WEBHOOK_URL,
        reachable: urlReachable,
        get_status: urlStatus,
        error: urlError,
        note: 'POST-only. GET returns 405 by design (healthy).',
      },
      events_handled: HANDLED_EVENTS,
    },
    { status: webhookHealthy ? 200 : 503 }
  );
}
