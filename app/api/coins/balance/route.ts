import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EMPTY = {
  balance: 0,
  lifetime_bought: 0,
  lifetime_spent: 0,
  lifetime_refunded: 0,
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(EMPTY, { status: 200 });
    }

    const { data, error } = await supabase
      .from('coin_wallet')
      .select('balance, lifetime_bought, lifetime_spent, lifetime_refunded')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(EMPTY, { status: 200 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[api/coins/balance] erro:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Erro interno' },
      { status: 500 }
    );
  }
}
