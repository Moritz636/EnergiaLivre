import { NextRequest, NextResponse } from 'next/server';
import { v } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';
import { getOnChainBalance } from '@/lib/web3';
import { rateLimit, getClientIp } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const ip = getClientIp(request.headers);
    const rl = await rateLimit({ identifier: `token-balance:${user.id}`, limit: 30, window: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Muitas consultas. Aguarde 1 minuto.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = v.object(Object.fromEntries(searchParams), {
      wallet: v.optional((i) => v.string(i, { max: 50 })),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    // 1) holding off-chain (cache)
    const { data: holding, error: holdErr } = await supabase
      .from('token_holdings')
      .select('balance, balance_locked, balance_available, lifetime_earned, lifetime_burned, wallet_address, last_synced_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (holdErr) {
      console.error('[api/token/balance] holdings error:', holdErr);
    }

    // 2) on-chain (se tiver wallet)
    let onChain = null;
    const wallet = parsed.data.wallet || (holding as any)?.wallet_address;
    if (wallet && /^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      try {
        onChain = await getOnChainBalance(wallet);
      } catch (e: any) {
        console.warn('[api/token/balance] on-chain read falhou:', e?.message);
      }
    }

    return NextResponse.json(
      {
        holding: holding || {
          balance: 0,
          balance_locked: 0,
          balance_available: 0,
          lifetime_earned: 0,
          lifetime_burned: 0,
        },
        on_chain: onChain,
        disclaimer: onChain ? null : 'Contrato ainda nao deployado. Saldo on-chain indisponivel.',
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (err: any) {
    console.error('[api/token/balance] exception:', err);
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 });
  }
}
