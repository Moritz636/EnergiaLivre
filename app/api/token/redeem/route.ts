import { NextRequest, NextResponse } from 'next/server';
import { v } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/ratelimit';
import { KWATT_UNIT_PRICE } from '@/lib/tokenomics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/token/redeem
 * Cria uma solicitacao de resgate de tokens em troca de beneficio real.
 * Tipos: invoice_payment | celular_recharge | cashback | donation
 *
 * O fluxo:
 *  1) usuario autenticado informa amount, type, target
 *  2) validamos saldo off-chain (token_holdings)
 *  3) gravamos em token_redemptions (status=pending)
 *  4) debitamos do holding (balance_locked++)
 *  5) admin processa (status=approved → processing → fulfilled)
 *  6) on-chain burn eh disparado pelo admin via script Node
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const ip = getClientIp(request.headers);
    const rl = await rateLimit({ identifier: `token-redeem:${user.id}`, limit: 10, window: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Muitas solicitacoes. Aguarde.' }, { status: 429 });
    }

    const json = await request.json().catch(() => ({}));
    const parsed = v.object(json, {
      amount_tokens: (i) => v.number(i, { min: 1, max: 1_000_000 }),
      redemption_type: (i) => v.enum(i, ['invoice_payment', 'celular_recharge', 'cashback', 'donation', 'other'] as const),
      target_id: v.optional((i) => v.string(i, { max: 80 })),
      target_type: v.optional((i) => v.string(i, { max: 40 })),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const data = parsed.data;
    const targetMetadata =
      typeof json.target_metadata === 'object' && json.target_metadata !== null
        ? json.target_metadata
        : {};

    // 1) verifica saldo
    const { data: holding, error: hErr } = await supabase
      .from('token_holdings')
      .select('balance, balance_locked')
      .eq('user_id', user.id)
      .maybeSingle();

    if (hErr) {
      console.error('[api/token/redeem] holdings err:', hErr);
      return NextResponse.json({ error: 'Nao foi possivel consultar seu saldo.' }, { status: 500 });
    }
    if (!holding || (holding.balance ?? 0) < data.amount_tokens) {
      return NextResponse.json(
        { error: 'Saldo insuficiente. Faca uma compra de tokens ou aguarde o lancamento (05/01/2027).' },
        { status: 400 }
      );
    }

    const amountBrl = Number((data.amount_tokens * KWATT_UNIT_PRICE).toFixed(2));
    const kwhEquivalent = Number((data.amount_tokens / 0.3).toFixed(2));

    // 2) cria redemption (pending)
    const { data: redemption, error: rErr } = await (supabase
      .from('token_redemptions')
      .insert({
        user_id: user.id,
        redemption_type: data.redemption_type,
        amount_tokens: data.amount_tokens,
        amount_brl: amountBrl,
        kwh_equivalent: kwhEquivalent,
        target_id: data.target_id ?? null,
        target_type: data.target_type ?? null,
        target_metadata: targetMetadata,
        status: 'pending',
      } as any)
      .select('id, status, amount_tokens, amount_brl')
      .single() as any);

    if (rErr) {
      console.error('[api/token/redeem] insert err:', rErr);
      return NextResponse.json({ error: 'Nao foi possivel registrar a solicitacao.' }, { status: 500 });
    }

    // 3) lock do saldo
    await supabase
      .from('token_holdings')
      .update({
        balance_locked: (holding.balance_locked ?? 0) + data.amount_tokens,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // 4) log no ledger
    await supabase.from('token_transactions').insert({
      user_id: user.id,
      tx_type: 'redeem',
      direction: 'out',
      amount: data.amount_tokens,
      purpose: data.redemption_type,
      ref_id: redemption.id,
      ref_table: 'token_redemptions',
      status: 'pending',
      metadata: { amount_brl: amountBrl, kwh_equivalent: kwhEquivalent },
    } as any);

    return NextResponse.json({
      success: true,
      redemption,
      message: `Resgate de ${data.amount_tokens} KWATT (R$ ${amountBrl.toFixed(2)}) registrado. Status: pendente de aprovacao.`,
    });
  } catch (err: any) {
    console.error('[api/token/redeem] exception:', err);
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 });
  }
}
