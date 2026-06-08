import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripeSecret = process.env.STRIPE_SECRET_KEY

export async function GET(req: NextRequest) {
  const pi = req.nextUrl.searchParams.get('pi')
  if (!pi) {
    return NextResponse.json({ error: 'Missing pi param' }, { status: 400 })
  }

  if (!stripeSecret) {
    return NextResponse.json({ status: 'unknown' })
  }

  try {
    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })
    const paymentIntent = await stripe.paymentIntents.retrieve(pi)
    return NextResponse.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    })
  } catch {
    return NextResponse.json({ status: 'unknown' })
  }
}
