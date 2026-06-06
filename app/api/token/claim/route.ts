import { NextRequest, NextResponse } from 'next/server';
import { v } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/ratelimit';
import { TOKEN_PACKAGES, getFinalPrice } from '@/lib/tokenomics';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/token/claim
 * Lista alocacoes disponiveis para o usuario (pre-registros confirmados).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const { data: preRegs } = await supabase
      .from('token_pre_registrations')
      .select('id, package_code, package_tokens, wallet_address, status, created_at')
      .or(`email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    const { data: airdrops } = await supabase
      .from('token_airdrops')
      .select('id, amount, package_code, status, tx_hash, confirmed_at, attempted_at, created_at')
      .or(`email.eq.${user.email},user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    const totalClaimable = (preRegs || [])
      .filter((p) => p.status === 'confirmed' || p.status === 'pending')
      .reduce((s, p) => s + (p.package_tokens ?? 0), 0);

    return NextResponse.json(
      {
        pre_registrations: preRegs || [],
        airdrops: airdrops || [],
        total_claimable: totalClaimable,
        can_claim: totalClaimable > 0,
        launch_date: '2027-01-05',
        disclaimer: 'Airdrops on-chain serao processados apos o lancamento oficial (05/01/2027). Acompanhe seu e-mail.',
      },
      { headers: { 'Cache-Control': 'private, max-age=30' } }
    );
  } catch (err: any) {
    console.error('[api/token/claim] exception:', err);
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 });
  }
}

/**
 * POST /api/token/claim
 * Registra/atualiza a wallet do usuario para receber o airdrop.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const ip = getClientIp(request.headers);
    const rl = await rateLimit({ identifier: `token-claim:${user.id}`, limit: 5, window: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde.' }, { status: 429 });
    }

    const json = await request.json().catch(() => ({}));
    const parsed = v.object(json, {
      wallet_address: (i) => v.string(i, { min: 40, max: 50 }),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const wallet = parsed.data.wallet_address.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Carteira invalida. Use endereco 0x... (EVM).' }, { status: 400 });
    }

    // Atualiza pre-registros do usuario (match por email)
    const { data: updated, error: upErr } = await supabase
      .from('token_pre_registrations')
      .update({ wallet_address: wallet, status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('email', user.email)
      .select('id, package_code, package_tokens, wallet_address');

    if (upErr) {
      console.error('[api/token/claim] update err:', upErr);
      return NextResponse.json({ error: 'Nao foi possivel atualizar.' }, { status: 500 });
    }

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { success: true, message: 'Carteira registrada. Voce sera notificado quando o airdrop for processado.' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      registrations_updated: updated.length,
      total_tokens: updated.reduce((s, r) => s + (r.package_tokens ?? 0), 0),
      message: `Carteira registrada. ${updated.length} pre-registro(s) confirmado(s). Airdrop sera processado em 05/01/2027.`,
    });
  } catch (err: any) {
    console.error('[api/token/claim] exception:', err);
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 });
  }
}
