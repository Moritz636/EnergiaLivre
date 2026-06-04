import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    // Verificar se é admin via JWT
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar estatísticas do cache (rápido)
    const { data: stats } = await supabase
      .from('stats_cache')
      .select('*')
      .eq('id', 1)
      .single();

    // Buscar leads recentes (últimos 5)
    const { data: leadsRecentes } = await supabase
      .from('leads')
      .select('id, nome, email, tipo, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Buscar comissões pendentes (top 5)
    const { data: comissoesPendentes } = await supabase
      .from('comissoes')
      .select(`
        id, valor_comissao, tipo_comissao, created_at,
        embaixador:embaixador_id (nome, email)
      `)
      .eq('status_pagamento', 'pendente')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: stats || {},
      leadsRecentes: leadsRecentes || [],
      comissoesPendentes: comissoesPendentes || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
