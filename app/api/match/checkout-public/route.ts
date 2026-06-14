// ============================================================
// POST /api/match/checkout-public
// Cria PaymentIntent Stripe com card (one-time R$ 9,99).
// Retorna client_secret para frontend finalizar checkout.
// Webhook payment_intent.succeeded ativa member_plus (30d).
// ============================================================

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const stripeSecret = process.env.STRIPE_SECRET_KEY
const AMOUNT_CENTS = 999 // R$ 9,99

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string
      usinaId?: string
    }
    const email = body.email?.trim().toLowerCase() || ''

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const targetEmail = user?.email || email
    if (!targetEmail) {
      return NextResponse.json(
        { error: 'E-mail obrigatorio para pagamento' },
        { status: 400 }
      )
    }

    if (!stripeSecret) {
      return NextResponse.json(
        { error: 'Stripe nao configurado' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })

    // Cria PaymentIntent com card
    const pi = await stripe.paymentIntents.create({
      amount: AMOUNT_CENTS,
      currency: 'brl',
      payment_method_types: ['card'],
      receipt_email: targetEmail,
      metadata: {
        userId: user?.id ?? '',
        userEmail: targetEmail,
        usinaId: body.usinaId ?? '',
        planoTipo: 'member_plus',
        planoCodigo: 'match_viewer_30d',
        planoNome: 'Match Viewer 30 dias',
        source: 'public_match_funnel',
      },
    })

    return NextResponse.json({
      ok: true,
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
    })
  } catch (err: any) {
    console.error('[checkout-public] erro:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
