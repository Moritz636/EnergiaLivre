import { NextRequest, NextResponse } from 'next/server';
import { v } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = v.object(Object.fromEntries(searchParams), {
      limit: v.optional((i) => v.number(i, { min: 1, max: 200 })),
      offset: v.optional((i) => v.number(i, { min: 0 })),
      type: v.optional((i) => v.string(i, { max: 30 })),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const limit = parsed.data.limit ?? 50;
    const offset = parsed.data.offset ?? 0;
    const type = parsed.data.type;

    let query = supabase
      .from('token_transactions')
      .select('id, tx_type, direction, amount, purpose, status, tx_hash, counterparty_wallet, metadata, created_at, confirmed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('tx_type', type);

    const { data, error } = await query;
    if (error) {
      console.error('[api/token/transactions] error:', error);
      return NextResponse.json({ error: 'Nao foi possivel listar transacoes.' }, { status: 500 });
    }

    return NextResponse.json(
      { transactions: data || [], count: data?.length || 0 },
      { headers: { 'Cache-Control': 'private, max-age=10' } }
    );
  } catch (err: any) {
    console.error('[api/token/transactions] exception:', err);
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 });
  }
}
