import { createClient } from '@/lib/supabase/server';
import { getPackageByCode } from '@/lib/coins/wallet';
import { getSiteUrl } from '@/lib/env';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface BuyBody {
  packageCode?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as BuyBody;
    const { packageCode } = body;

    if (!packageCode || typeof packageCode !== 'string') {
      return NextResponse.json(
        { error: 'packageCode é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const pkg = await getPackageByCode(packageCode);
    if (!pkg) {
      return NextResponse.json(
        { error: 'Pacote não encontrado ou inativo' },
        { status: 404 }
      );
    }

    const siteUrl = getSiteUrl();
    const successUrl = `${siteUrl}/dashboard-gerador/moedas?success=1&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/dashboard-gerador/moedas?canceled=1`;

    // Cria Checkout Session de pagamento único.
    // Usamos price_data inline (sem necessidade de pre-criar price no Stripe).
    // O webhook identifica pelo metadata.kind === 'coin_purchase'.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: pkg.currency,
            product_data: {
              name: `${pkg.coins} Moedas EnergiaLivre`,
              description: pkg.description ?? `Pacote ${pkg.name}`,
              metadata: {
                packageCode: pkg.code,
                coins: String(pkg.coins),
              },
            },
            unit_amount: pkg.price_cents,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        kind: 'coin_purchase',
        userId: user.id,
        userEmail: user.email ?? '',
        packageId: String(pkg.id),
        packageCode: pkg.code,
        packageName: pkg.name,
        coins: String(pkg.coins),
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('[api/coins/buy] erro:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Erro interno ao criar checkout' },
      { status: 500 }
    );
  }
}
