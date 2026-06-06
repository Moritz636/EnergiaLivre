import { NextResponse } from 'next/server';
import { getTokenInfo } from '@/lib/web3';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const info = await getTokenInfo();
    return NextResponse.json(
      {
        ...info,
        source: info.isDeployed ? 'on-chain' : 'placeholder',
        disclaimer: 'Token ainda nao deployado em mainnet. Launch oficial: 05/01/2027.',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err: any) {
    console.error('[api/token/info] error:', err);
    return NextResponse.json(
      { error: 'Nao foi possivel obter informacoes do token.', detail: err?.message },
      { status: 500 }
    );
  }
}
