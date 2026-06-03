import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Planos disponíveis (Lei 16: Ausência aumenta o valor)
const PLANOS = {
  basico: {
    id: 'price_basico',
    nome: 'Plano Básico',
    descricao: '300 kWh de energia limpa/mês',
    valor: 89.90,
    economia: 25,
    kwh: 300,
  },
  familiar: {
    id: 'price_familiar',
    nome: 'Plano Familiar',
    descricao: '500 kWh de energia limpa/mês',
    valor: 149.90,
    economia: 32,
    kwh: 500,
  },
  premium: {
    id: 'price_premium',
    nome: 'Plano Premium',
    descricao: '1000 kWh de energia limpa/mês',
    valor: 289.90,
    economia: 38,
    kwh: 1000,
  },
};

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  
  try {
    const { userId, planoId, successUrl, cancelUrl } = await request.json();

    // Validar plano
    const plano = (PLANOS as any)[planoId];
    if (!plano) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // Obter usuário do Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (user.id !== userId) {
      return NextResponse.json({ error: 'Usuário não corresponde' }, { status: 401 });
    }

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plano.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planoId,
        planoNome: plano.nome,
      },
    });

    // Criar registro de assinatura no banco
    const { data: assinatura, error: assinaturaError } = await supabase
      .from('assinaturas')
      .insert({
        user_id: user.id,
        stripe_subscription_id: session.id,
        stripe_price_id: plano.id,
        nome_plano: plano.nome,
        valor_mensal: plano.valor,
        kwh_mensais: plano.kwh,
        economia_percentual: plano.economia,
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      })
      .select()
      .single();

    if (assinaturaError) {
      // Se falhar, deletar a sessão do Stripe
      await stripe.checkout.sessions.expire(session.id);
      throw assinaturaError;
    }

    return NextResponse.json({ url: session.url, assinatura });

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

    // Cancelar assinatura no Stripe
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Atualizar status no banco
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