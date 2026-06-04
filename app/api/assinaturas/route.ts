import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { isValidPriceId, getPlanoByPriceId, type PlanoTipo } from '@/lib/stripe-prices';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  try {
    const {
      priceId,
      planoTipo,
      planoCodigo,
      planoNome,
      successUrl,
      cancelUrl,
    } = await request.json();

    if (!priceId || !isValidPriceId(priceId)) {
      return NextResponse.json({ error: 'priceId inválido' }, { status: 400 });
    }

    const meta = getPlanoByPriceId(priceId);
    if (!meta) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    const tipoFinal: PlanoTipo = (planoTipo as PlanoTipo) || meta.tipo;
    const codigoFinal = (planoCodigo as string) || meta.codigo;
    const nomeFinal = (planoNome as string) || meta.nome;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const defaultSuccess = tipoFinal === 'gerador'
      ? `${siteUrl}/dashboard-gerador?success=true`
      : tipoFinal === 'member_plus'
        ? `${siteUrl}/dashboard/match?success=true`
        : `${siteUrl}/dashboard?success=true`;
    const defaultCancel = tipoFinal === 'gerador'
      ? `${siteUrl}/checkout-gerador?canceled=true`
      : tipoFinal === 'member_plus'
        ? `${siteUrl}/dashboard/match?canceled=true`
        : `${siteUrl}/checkout?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl ?? defaultSuccess,
      cancel_url: cancelUrl ?? defaultCancel,
      customer_email: user.email ?? undefined,
      metadata: {
        userId: user.id,
        userEmail: user.email ?? '',
        planoTipo: tipoFinal,
        planoCodigo: codigoFinal,
        planoNome: nomeFinal,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planoTipo: tipoFinal,
          planoCodigo: codigoFinal,
          planoNome: nomeFinal,
        },
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabase
      .from('assinaturas')
      .select('*')
      .order('current_period_end', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      assinaturas: data,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerClient();

  try {
    const { subscriptionId } = await request.json();

    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    await supabase
      .from('assinaturas')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso',
      cancel_at_period_end: canceledSubscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
