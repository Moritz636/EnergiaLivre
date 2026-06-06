import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTokenInfo } from '@/lib/web3';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/token/metrics
 * Endpoint PUBLICO com metricas agregadas.
 * Combina dados on-chain (supply) com dados off-chain (holders, redemptions).
 * Cacheado 5min.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const [info, metricsRpcRes, preRegsCount, redemptionsAgg] = await Promise.all([
      getTokenInfo().catch(() => null),
      supabase.rpc('get_token_metrics' as any),
      supabase.from('token_pre_registrations').select('*', { count: 'exact', head: true }),
      supabase.from('token_redemptions').select('amount_tokens', { count: 'exact' }),
    ]);
    const metricsRpc = metricsRpcRes?.data ?? null;

    const totalPreRegs = preRegsCount.count ?? 0;
    const totalRedemptions = redemptionsAgg.count ?? 0;

    return NextResponse.json(
      {
        on_chain: info,
        off_chain: metricsRpc || {},
        public_metrics: {
          total_pre_registrations: totalPreRegs,
          total_redemptions_processed: totalRedemptions,
          presale_end_date: '2026-09-09',
          launch_date: '2027-01-05',
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: any) {
    console.error('[api/token/metrics] error:', err);
    return NextResponse.json(
      { error: 'Nao foi possivel carregar metricas.' },
      { status: 500 }
    );
  }
}
