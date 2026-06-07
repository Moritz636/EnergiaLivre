// ============================================================
// POST /api/match/checkout-public
// Cria sessao Stripe para liberar acesso ao /match por 30 dias.
// Se o usuario NAO estiver autenticado, gera um session_id
// que sera vinculado ao user no webhook via metadata.email.
// ============================================================

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { STRIPE_PRICE_IDS, STRIPE_PAYMENT_LINKS } from '@/lib/stripe-prices'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const stripeSecret = process.env.STRIPE_SECRET_KEY

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
        { error: 'E-mail obrigatorio para checkout' },
        { status: 400 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const successUrl = `${siteUrl}/match?session_id={CHECKOUT_SESSION_ID}&unlocked=1`
    const cancelUrl = `${siteUrl}/match?canceled=1`

    // Caminho 1: Stripe API direta (cria sessao dinamica)
    if (stripeSecret) {
      try {
        const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{ price: STRIPE_PRICE_IDS.MEMBER_PLUS, quantity: 1 }],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: targetEmail,
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
          url: session.url,
          sessionId: session.id,
          source: 'stripe_api',
        })
      } catch (stripeErr: any) {
        console.error('[checkout-public] stripe api falhou, usando payment link:', stripeErr.message)
        // Cai no fallback abaixo
      }
    }

    // Caminho 2: Payment Link (compra direta)
    const baseLink = STRIPE_PAYMENT_LINKS.MEMBER_PLUS
    return NextResponse.json({
      ok: true,
      url: baseLink,
      sessionId: null,
      source: 'payment_link',
      notice: 'Usando Payment Link — checkout redireciona direto ao Stripe.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
