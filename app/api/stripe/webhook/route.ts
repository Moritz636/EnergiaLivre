import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ============================================
// WEBHOOK DO STRIPE - AUTOMAÇÃO TOTAL
// ============================================

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook (Lei 1: Controle absoluto)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
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

        if (userId) {
          // Verificar se já existe para evitar duplicação
          const { data: existing } = await supabase
            .from('assinaturas')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single();

          if (!existing) {
            await supabase
              .from('assinaturas')
              .insert({
                user_id: userId,
                stripe_subscription_id: subscription.id,
                stripe_price_id: subscription.items.data[0].price.id,
                nome_plano: subscription.metadata?.planoNome || 'Plano',
                valor_mensal: (subscription.items.data[0].price.unit_amount || 0) / 100,
                kwh_mensais: parseInt(subscription.metadata?.kwh || '300'),
                economia_percentual: parseInt(subscription.metadata?.economia || '25'),
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000),
                current_period_end: new Date(subscription.current_period_end * 1000),
                cancel_at_period_end: subscription.cancel_at_period_end,
              });

            // Criar comissão para embaixador (se houver)
            await criarComissaoCadastro(supabase, userId, subscription);
          }
        }
        break;
      }

      // ============================================
      // PAGAMENTO BEM-SUCEDIDO (FATURA PAGA)
      // ============================================
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Buscar user_id a partir da assinatura
          const { data: assinatura } = await supabase
            .from('assinaturas')
            .select('user_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (!assinatura) {
            console.error(`Assinatura ${subscriptionId} não encontrada`);
            break;
          }

          // Atualizar status da assinatura
          await supabase
            .from('assinaturas')
            .update({
              status: 'active',
              current_period_start: new Date(invoice.period_start * 1000),
              current_period_end: new Date(invoice.period_end * 1000),
            })
            .eq('stripe_subscription_id', subscriptionId);

          // Registrar pagamento com UUID correto
          await supabase
            .from('pagamentos')
            .insert({
              user_id: assinatura.user_id,
              tipo_pagamento: 'assinatura',
              valor: invoice.amount_paid / 100,
              status: 'succeeded',
              stripe_payment_intent: invoice.payment_intent as string,
              description: `Assinatura - ${invoice.lines.data[0]?.description || 'Plano'}`,
              processed_at: new Date().toISOString(),
            });

          // Criar comissão recorrente para embaixador (se houver)
          await criarComissaoRecorrente(supabase, subscriptionId, invoice.amount_paid / 100);
        }
        break;
      }

      // ============================================
      // PAGAMENTO FALHOU
      // ============================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const { data: assinatura } = await supabase
            .from('assinaturas')
            .select('user_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (assinatura) {
            await supabase
              .from('assinaturas')
              .update({ status: 'past_due' })
              .eq('stripe_subscription_id', subscriptionId);

            await supabase
              .from('pagamentos')
              .insert({
                user_id: assinatura.user_id,
                tipo_pagamento: 'assinatura',
                valor: invoice.amount_due / 100,
                status: 'failed',
                stripe_payment_intent: invoice.payment_intent as string,
                description: 'Pagamento falhou',
              });
          }
        }
        break;
      }

      // ============================================
      // ASSINATURA ATUALIZADA
      // ============================================
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from('assinaturas')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      // ============================================
      // ASSINATURA CANCELADA
      // ============================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from('assinaturas')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        // Cancelar comissões recorrentes futuras
        await supabase
          .from('comissoes')
          .update({
            status_pagamento: 'cancelado',
          })
          .eq('cliente_id', subscription.metadata?.userId)
          .eq('tipo_comissao', 'recorrente')
          .eq('status_pagamento', 'pendente');
        break;
      }

      // ============================================
      // REEMBOLSO
      // ============================================
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const customerId = charge.customer as string;

        if (customerId) {
          // Buscar user_id via assinatura
          const { data: assinatura } = await supabase
            .from('assinaturas')
            .select('user_id')
            .eq('stripe_subscription_id', charge.invoice as string)
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
// FUNÇÕES AUXILIARES PARA COMISSÕES
// ============================================

async function criarComissaoCadastro(
  supabase: any,
  userId: string,
  subscription: Stripe.Subscription
) {
  // Verificar se o usuário foi indicado por um embaixador
  const { data: lead } = await supabase
    .from('leads')
    .select('embaixador_id')
    .eq('user_id', userId)
    .single();

  if (lead?.embaixador_id) {
    const valorPlano = (subscription.items.data[0].price.unit_amount || 0) / 100;
    const comissao = (valorPlano * 100) / 100; // 100% no cadastro

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
  // Buscar assinatura para encontrar o cliente
  const { data: assinatura } = await supabase
    .from('assinaturas')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!assinatura) return;

  // Verificar se o cliente tem embaixador
  const { data: lead } = await supabase
    .from('leads')
    .select('embaixador_id')
    .eq('user_id', assinatura.user_id)
    .single();

  if (lead?.embaixador_id) {
    const comissao = (valor * 5) / 100; // 5% recorrente

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