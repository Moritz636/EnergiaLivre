import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { getPlanoByPriceId, type PlanoTipo } from '@/lib/stripe-prices';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ============================================
// WEBHOOK DO STRIPE - MULTI-PLANO
// Switch em session.metadata.planoTipo:
//   - 'consumidor'  → insere em 'assinaturas' (Lei 16)
//   - 'gerador'     → insere em 'assinaturas' (plano de venda)
//   - 'member_plus' → ativa flag em 'profiles.member_plus_active' (30d)
// ============================================

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();

  try {
    switch (event.type) {
      // ============================================
      // ASSINATURA CRIADA
      // ============================================
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const planoTipo = (subscription.metadata?.planoTipo || 'consumidor') as PlanoTipo;

        if (!userId) break;

        if (planoTipo === 'member_plus') {
          await ativarMemberPlus(supabase, userId, subscription);
        } else {
          await criarAssinaturaPlano(supabase, userId, subscription, planoTipo);
          await criarComissaoCadastro(supabase, userId, subscription);
        }
        break;
      }

      // ============================================
      // PAGAMENTO BEM-SUCEDIDO (FATURA PAGA)
      // ============================================
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const { data: assinatura } = await supabase
          .from('assinaturas')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!assinatura) {
          console.error(`Assinatura ${subscriptionId} não encontrada`);
          break;
        }

        // Para member_plus, atualiza expires_at
        const planoTipo = (invoice.lines.data[0]?.metadata?.planoTipo || 'consumidor') as PlanoTipo;
        if (planoTipo === 'member_plus') {
          const periodEnd = new Date(invoice.period_end * 1000);
          await supabase
            .from('profiles')
            .update({
              member_plus_active: true,
              member_plus_expires_at: periodEnd.toISOString(),
            })
            .eq('id', assinatura.user_id);
        } else {
          // Para planos consumidor/gerador, atualiza assinatura
          await supabase
            .from('assinaturas')
            .update({
              status: 'active',
              current_period_start: new Date(invoice.period_start * 1000),
              current_period_end: new Date(invoice.period_end * 1000),
            })
            .eq('stripe_subscription_id', subscriptionId);

          // Comissão recorrente para embaixador
          await criarComissaoRecorrente(supabase, subscriptionId, invoice.amount_paid / 100);
        }

        // Registra pagamento (todos os tipos)
        await supabase
          .from('pagamentos')
          .insert({
            user_id: assinatura.user_id,
            tipo_pagamento: 'assinatura',
            valor: invoice.amount_paid / 100,
            status: 'succeeded',
            stripe_payment_intent: (invoice.payment_intent as string | null) ?? null,
            description: `${planoTipo} - ${invoice.lines.data[0]?.description || 'Plano'}`,
            processed_at: new Date().toISOString(),
          });
        break;
      }

      // ============================================
      // PAGAMENTO FALHOU
      // ============================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const { data: assinatura } = await supabase
          .from('assinaturas')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!assinatura) break;

        const planoTipo = (invoice.lines.data[0]?.metadata?.planoTipo || 'consumidor') as PlanoTipo;
        if (planoTipo === 'member_plus') {
          await supabase
            .from('profiles')
            .update({ member_plus_active: false })
            .eq('id', assinatura.user_id);
        } else {
          await supabase
            .from('assinaturas')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);
        }

      await supabase
        .from('pagamentos')
        .insert({
          user_id: assinatura.user_id,
          tipo_pagamento: 'assinatura',
          valor: invoice.amount_due / 100,
          status: 'failed',
          stripe_payment_intent: (invoice.payment_intent as string | null) ?? null,
          description: 'Pagamento falhou',
        });
        break;
      }

      // ============================================
      // ASSINATURA ATUALIZADA
      // ============================================
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const planoTipo = (subscription.metadata?.planoTipo || 'consumidor') as PlanoTipo;

        if (planoTipo === 'member_plus') {
          const active = subscription.status === 'active';
          const periodEnd = new Date(subscription.current_period_end * 1000);
          await supabase
            .from('profiles')
            .update({
              member_plus_active: active,
              member_plus_expires_at: periodEnd.toISOString(),
            })
            .eq('id', subscription.metadata?.userId);
        } else {
          await supabase
            .from('assinaturas')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000),
              current_period_end: new Date(subscription.current_period_end * 1000),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      // ============================================
      // ASSINATURA CANCELADA
      // ============================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const planoTipo = (subscription.metadata?.planoTipo || 'consumidor') as PlanoTipo;

        if (planoTipo === 'member_plus') {
          await supabase
            .from('profiles')
            .update({ member_plus_active: false })
            .eq('id', subscription.metadata?.userId);
        } else {
          await supabase
            .from('assinaturas')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          await supabase
            .from('comissoes')
            .update({ status_pagamento: 'cancelado' })
            .eq('cliente_id', subscription.metadata?.userId)
            .eq('tipo_comissao', 'recorrente')
            .eq('status_pagamento', 'pendente');
        }
        break;
      }

      // ============================================
      // REEMBOLSO
      // ============================================
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const invoiceId = (charge.invoice as string | null) ?? null;

        // charge.invoice é null em pagamentos únicos fora de assinatura.
        // Nesses casos, o reembolso é registrado apenas se houver invoice
        // vinculada a uma assinatura conhecida.
        if (!invoiceId) {
          console.warn(`charge.refunded sem invoice vinculada: ${charge.id}`);
          break;
        }

        const { data: assinatura } = await supabase
          .from('assinaturas')
          .select('user_id')
          .eq('stripe_subscription_id', invoiceId)
          .single();

        if (assinatura) {
          await supabase
            .from('pagamentos')
            .insert({
              user_id: assinatura.user_id,
              tipo_pagamento: 'assinatura',
              valor: charge.amount_refunded / 100,
              status: 'refunded',
              stripe_charge_id: charge.id,
              description: 'Reembolso processado',
              processed_at: new Date().toISOString(),
            });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ============================================
// HELPERS
// ============================================

async function criarAssinaturaPlano(
  supabase: any,
  userId: string,
  subscription: Stripe.Subscription,
  planoTipo: PlanoTipo
) {
  const { data: existing } = await supabase
    .from('assinaturas')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (existing) return;

  const priceId = subscription.items.data[0].price.id;
  const meta = getPlanoByPriceId(priceId);

  await supabase
    .from('assinaturas')
    .insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      nome_plano: meta?.nome || subscription.metadata?.planoNome || 'Plano',
      valor_mensal: (subscription.items.data[0].price.unit_amount || 0) / 100,
      kwh_mensais: meta?.kwh ?? null,
      capacidade_kwp: meta?.capacidadeKwp ?? null,
      economia_percentual: meta?.economiaPercentual ?? null,
      tipo_plano: planoTipo,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
}

async function ativarMemberPlus(
  supabase: any,
  userId: string,
  subscription: Stripe.Subscription
) {
  const periodEnd = new Date(subscription.current_period_end * 1000);
  await supabase
    .from('profiles')
    .update({
      member_plus_active: true,
      member_plus_activated_at: new Date().toISOString(),
      member_plus_expires_at: periodEnd.toISOString(),
    })
    .eq('id', userId);
}

async function criarComissaoCadastro(
  supabase: any,
  userId: string,
  subscription: Stripe.Subscription
) {
  const { data: lead } = await supabase
    .from('leads')
    .select('embaixador_id')
    .eq('user_id', userId)
    .single();

  if (lead?.embaixador_id) {
    const valorPlano = (subscription.items.data[0].price.unit_amount || 0) / 100;
    const comissao = valorPlano;

    await supabase
      .from('comissoes')
      .insert({
        embaixador_id: lead.embaixador_id,
        cliente_id: userId,
        valor_comissao: comissao,
        percentual: 100,
        tipo_comissao: 'cadastro',
        status_pagamento: 'pago',
        data_pagamento: new Date().toISOString(),
        mes_referencia: new Date().toISOString().slice(0, 7) + '-01',
        ano_referencia: new Date().getFullYear(),
      });
  }
}

async function criarComissaoRecorrente(
  supabase: any,
  subscriptionId: string,
  valor: number
) {
  const { data: assinatura } = await supabase
    .from('assinaturas')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!assinatura) return;

  const { data: lead } = await supabase
    .from('leads')
    .select('embaixador_id')
    .eq('user_id', assinatura.user_id)
    .single();

  if (lead?.embaixador_id) {
    const comissao = (valor * 5) / 100;

    await supabase
      .from('comissoes')
      .insert({
        embaixador_id: lead.embaixador_id,
        cliente_id: assinatura.user_id,
        valor_comissao: comissao,
        percentual: 5,
        tipo_comissao: 'recorrente',
        status_pagamento: 'pago',
        data_pagamento: new Date().toISOString(),
        mes_referencia: new Date().toISOString().slice(0, 7) + '-01',
        ano_referencia: new Date().getFullYear(),
      });
  }
}
