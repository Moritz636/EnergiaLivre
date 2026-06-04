import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { userId, tipo, valor, leadId, clienteId } = await request.json();

    if (!userId || !tipo || !valor || !leadId) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Verificar se o usuário é embaixador/admin
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role, tipo')
      .eq('id', userId)
      .single();

    if (!userProfile || (userProfile.role !== 'admin' && userProfile.tipo !== 'gerador')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Validar que o lead existe e pertence ao embaixador (se não for admin)
    const { data: leadValidado } = await supabase
      .from('leads')
      .select('id, user_id, embaixador_id')
      .eq('id', leadId)
      .single();

    if (!leadValidado) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    if (userProfile.role !== 'admin' && leadValidado.embaixador_id !== userId) {
      return NextResponse.json({ error: 'Lead não pertence a este embaixador' }, { status: 403 });
    }

    // Definir percentuais
    let percentual = 0;
    if (tipo === 'cadastro') {
      percentual = 100;
    } else if (tipo === 'recorrente') {
      percentual = 5;
    } else {
      return NextResponse.json({ error: 'Tipo de comissão inválido' }, { status: 400 });
    }

    const valorComissao = (valor * percentual) / 100;

    // Criar registro de comissão com cliente_id correto
    const { data: comissaoData, error: comissaoError } = await supabase
      .from('comissoes')
      .insert({
        embaixador_id: userId,
        cliente_id: clienteId || leadValidado.user_id,
        lead_id: leadId,
        valor_comissao: valorComissao,
        percentual,
        tipo_comissao: tipo,
        status_pagamento: 'pendente',
        mes_referencia: new Date().toISOString().slice(0, 7) + '-01',
        ano_referencia: new Date().getFullYear(),
      })
      .select()
      .single();

    if (comissaoError) throw comissaoError;

    return NextResponse.json({
      success: true,
      comissao: comissaoData,
      message: `Comissão de R$ ${valorComissao.toFixed(2)} criada com sucesso!`,
    });
  } catch (error: any) {
    console.error('Error creating commission:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar comissão' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50'), 100);

    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('comissoes')
      .select(`
        *,
        embaixador:embaixador_id (nome, email),
        cliente:cliente_id (nome, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (userId) {
      query = query.eq('embaixador_id', userId);
    }

    if (status) {
      query = query.eq('status_pagamento', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Calcular totais via agregação SQL
    const { data: totaisData } = await supabase
      .from('comissoes')
      .select('valor_comissao, status_pagamento')
      .eq(userId ? 'embaixador_id' : 'id', userId || undefined);

    const totais = {
      totalPendente: 0,
      totalPago: 0,
      totalCancelado: 0,
    };

    if (totaisData) {
      totaisData.forEach((c: any) => {
        const valor = Number(c.valor_comissao) || 0;
        if (c.status_pagamento === 'pendente') totais.totalPendente += valor;
        else if (c.status_pagamento === 'pago') totais.totalPago += valor;
        else if (c.status_pagamento === 'cancelado') totais.totalCancelado += valor;
      });
    }

    return NextResponse.json({
      success: true,
      comissoes: data || [],
      totais,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error: any) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar comissões' },
      { status: 500 }
    );
  }
}
