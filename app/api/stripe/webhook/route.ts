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
      // CHECKOUT ONE-TIME COMPLETED (COMPRA DE MOEDAS)
      // ============================================
      // Dispara após pagamento confirmado em mode=payment.
      // Credita o wallet via RPC credit_wallet (idempotente).
      // ============================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Ignora checkouts de assinatura (processados via
        // customer.subscription.* abaixo)
        if (session.mode !== 'payment') break;

        // Só processa quando o pagamento foi confirmado
        if (session.payment_status !== 'paid') break;

        const userId = session.metadata?.userId;
        const paymentType = session.metadata?.type;
        const coinsRaw = session.metadata?.coins;
        const packageCode = session.metadata?.packageCode ?? 'pacote';

        const coins = parseInt(coinsRaw ?? '0', 10);

        // Moeda Energia: amount vem como string no metadata
        let amount = coins
        if (paymentType === 'moeda_energia') {
          amount = Math.round(parseFloat(session.metadata?.amount ?? '0'))
        }

        if (!userId || !Number.isFinite(amount) || amount <= 0) {
          console.error(
            '[webhook] checkout.session.completed sem metadata válido:',
            { userId, amount, paymentType }
          );
          break;
        }

        const { data: rpcResult, error: rpcErr } = await supabase.rpc(
          'credit_wallet',
          {
            p_user_id: userId,
            p_amount: amount,
            p_type: 'purchase',
            p_reason: paymentType === 'moeda_energia'
              ? `Compra de Moeda Energia — R$ ${amount.toFixed(2)}`
              : `Compra de pacote (${packageCode})`,
            p_coin_package_id: null,
            p_stripe_session_id: session.id,
            p_stripe_payment_intent_id:
              (session.payment_intent as string | null) ?? null,
            p_metadata: {
              packageCode,
              paymentType,
              amount_total: session.amount_total,
              currency: session.currency,
            },
          }
        );

        if (rpcErr) {
          console.error('[webhook] credit_wallet rpc falhou:', rpcErr);
          throw rpcErr;
        }

        console.log(
          `[webhook] Moedas creditadas: user=${userId} amount=${amount} tx=${rpcResult?.[0]?.transaction_id}`
        );
        break;
      }

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

          // Comissão recorrente para parceiro
          await criarComissaoRecorrente(supabase, subscriptionId, invoice.amount_paid / 100);
        }

        // Registra pagamento (todos os tipos)
        const { data: newPag } = await supabase
          .from('pagamentos')
          .insert({
            user_id: assinatura.user_id,
            tipo_pagamento: 'assinatura',
            valor: invoice.amount_paid / 100,
            status: 'succeeded',
            stripe_payment_intent: (invoice.payment_intent as string | null) ?? null,
            description: `${planoTipo} - ${invoice.lines.data[0]?.description || 'Plano'}`,
            processed_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        // Processa comissões 5% parceiro + 15% UFV (idempotente)
        if (newPag?.id) {
          const { error: commErr } = await supabase.rpc('process_payment_commissions', {
            p_payment_id: newPag.id,
          });
          if (commErr) {
            console.error(`[commissions] payment #${newPag.id} falhou:`, commErr);
          }
        }
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
      // PAYMENT INTENT SUCCEEDED — PIX ONE-TIME (ex: match R$ 9,99)
      // ============================================
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const planoTipo = pi.metadata?.planoTipo;
        const userId = pi.metadata?.userId;
        const userEmail = pi.metadata?.userEmail;
        const usinaId = pi.metadata?.usinaId;
        const source = pi.metadata?.source;

        const purpose = pi.metadata?.purpose;

        // Wallet top-up via PIX
        if (purpose === 'wallet_topup' && userId) {
          const amount = pi.amount / 100;
          const desc = pi.metadata?.description || `Recarga de carteira — R$ ${amount.toFixed(2)}`;

          const { error: creditErr } = await supabase.rpc('credit_wallet', {
            p_user_id: userId,
            p_amount: amount,
            p_type: 'deposit',
            p_reason: desc,
            p_coin_package_id: null,
            p_stripe_session_id: null,
            p_stripe_payment_intent_id: pi.id,
            p_metadata: { purpose: 'wallet_topup', payment_intent_id: pi.id },
          });

          await supabase.from('pagamentos').insert({
            user_id: userId,
            tipo_pagamento: 'pix_wallet',
            valor: amount,
            status: 'succeeded',
            stripe_payment_intent: pi.id,
            description: desc,
            processed_at: new Date().toISOString(),
          });

          if (creditErr) {
            console.error('[webhook] credit_wallet (topup) falhou:', creditErr);
          } else {
            console.log(`[webhook] wallet creditado via PIX: user=${userId} amount=${amount} pi=${pi.id}`);
          }
          break;
        }

        // Só processa pagamentos do funil publico /match (member_plus)
        if (planoTipo === 'member_plus' && source === 'public_match_funnel') {
          const targetUserId = userId || (await (async () => {
            if (!userEmail) return null;
            const { data } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', userEmail)
              .single();
            return data?.id ?? null;
          })());

          if (targetUserId) {
            // Ativa member_plus por 30 dias
            const periodEnd = new Date();
            periodEnd.setDate(periodEnd.getDate() + 30);
            await supabase
              .from('profiles')
              .update({
                member_plus_active: true,
                member_plus_activated_at: new Date().toISOString(),
                member_plus_expires_at: periodEnd.toISOString(),
              })
              .eq('id', targetUserId);

            // Credita transação no wallet (se houver sistema de creditos)
            try {
              await supabase.rpc('credit_user', {
                p_user_id: targetUserId,
                p_amount: pi.amount / 100,
                p_type: 'purchase',
                p_description: `Compra Match Viewer 30d (PIX) — usina: ${usinaId ?? 'N/A'}`,
                p_admin_id: null,
                p_metadata: { payment_intent_id: pi.id, usinaId, source: 'match_pix' },
              });
            } catch {
              // credit_user pode nao existir se migration nao aplicada
            }

            // Log do pagamento
            await supabase
              .from('pagamentos')
              .insert({
                user_id: targetUserId,
                tipo_pagamento: 'match_pix',
                valor: pi.amount / 100,
                status: 'succeeded',
                stripe_payment_intent: pi.id,
                description: `Match Viewer 30d — PIX`,
                processed_at: new Date().toISOString(),
              });

            console.log(`[webhook] member_plus ativado via PIX: user=${targetUserId} pi=${pi.id}`);
          }
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
