import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const requested = parseInt(url.searchParams.get('limit') ?? '50', 10);
    const limit = Math.min(Number.isFinite(requested) ? requested : 50, 200);

    const { data, error } = await supabase
      .from('coin_transactions')
      .select(
        'id, type, amount, balance_after, reason, related_entity_type, related_entity_id, coin_package_id, stripe_session_id, created_at'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ transactions: data ?? [] });
  } catch (error: any) {
    console.error('[api/coins/history] erro:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Erro interno' },
      { status: 500 }
    );
  }
}
