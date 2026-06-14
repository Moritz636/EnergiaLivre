import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const MIN_AMOUNT = 10
const MAX_AMOUNT = 5000

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { amount } = await req.json()
    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount < MIN_AMOUNT || numericAmount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Valor deve estar entre R$ ${MIN_AMOUNT} e R$ ${MAX_AMOUNT}` },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Moeda Energia',
              description: `Crédito de R$ ${numericAmount.toFixed(2)} para abater na fatura de energia`,
            },
            unit_amount: Math.round(numericAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/checkout/moeda-energia?success=true&amount=${numericAmount}`,
      cancel_url: `${siteUrl}/checkout/moeda-energia?canceled=true`,
      customer_email: user.email || undefined,
      metadata: {
        userId: user.id,
        userEmail: user.email ?? '',
        type: 'moeda_energia',
        amount: String(numericAmount),
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error('Erro no checkout Moeda Energia:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
