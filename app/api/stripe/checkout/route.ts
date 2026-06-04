import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { isValidPriceId, getPlanoByPriceId } from '@/lib/stripe-prices'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const {
      priceId,
      planoTipo,
      planoCodigo,
      planoNome,
      customerEmail,
      successUrl,
      cancelUrl,
    } = await req.json()

    if (!priceId || !isValidPriceId(priceId)) {
      return NextResponse.json({ error: 'priceId inválido' }, { status: 400 })
    }

    const planoMeta = getPlanoByPriceId(priceId)
    if (!planoMeta) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    const tipoFinal = (planoTipo as string) || planoMeta.tipo
    const codigoFinal = (planoCodigo as string) || planoMeta.codigo
    const nomeFinal = (planoNome as string) || planoMeta.nome
    const emailFinal = (customerEmail as string) || ''

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const defaultSuccess = tipoFinal === 'gerador'
      ? `${siteUrl}/dashboard-gerador?success=true`
      : tipoFinal === 'member_plus'
        ? `${siteUrl}/dashboard/match?success=true`
        : `${siteUrl}/dashboard?success=true`
    const defaultCancel = tipoFinal === 'gerador'
      ? `${siteUrl}/checkout-gerador?canceled=true`
      : tipoFinal === 'member_plus'
        ? `${siteUrl}/dashboard/match?canceled=true`
        : `${siteUrl}/checkout?canceled=true`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl ?? defaultSuccess,
      cancel_url: cancelUrl ?? defaultCancel,
      customer_email: emailFinal || user.email || undefined,
      metadata: {
        userId: user.id,
        userEmail: user.email ?? '',
        planoTipo: tipoFinal,
        planoCodigo: codigoFinal,
        planoNome: nomeFinal,
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error('Erro no checkout:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
