import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    // Buscar código de indicação do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    // Buscar indicações feitas
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred:referred_id (nome, email)
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Estatísticas
    const stats = {
      total: referrals?.length || 0,
      convertidos: referrals?.filter(r => r.status === 'convertido').length || 0,
      pendentes: referrals?.filter(r => r.status === 'pendente').length || 0,
    };

    return NextResponse.json({
      success: true,
      referralCode: profile?.referral_code,
      referrals: referrals || [],
      stats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  try {
    const { referralCode } = await request.json();

    if (!referralCode) {
      return NextResponse.json({ error: 'Código de indicação é obrigatório' }, { status: 400 });
    }

    // Buscar usuário que indicou
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referralCode.toUpperCase())
      .single();

    if (!referrer) {
      return NextResponse.json({ error: 'Código de indicação inválido' }, { status: 404 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    if (referrer.id === user.id) {
      return NextResponse.json({ error: 'Você não pode indicar a si mesmo' }, { status: 400 });
    }

    // Atualizar referred_by no perfil do usuário
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ referred_by: referrer.id })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Criar registro de referral
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: user.id,
        referral_code: referralCode.toUpperCase(),
        status: 'pendente',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, referral: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
