import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { calcular_comissao_cadastro, calcular_comissao_recorrente } from '@/lib/comissoes';

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  
  try {
    const { userId, tipo, valor, leadId } = await request.json();

    // Verificar se o usuário é embaixador
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role, tipo')
      .eq('id', userId)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let comissao;
    let percentual = 0;

    // Definir percentuais comissionamento (Lei 38: controle sobre o valor)
    if (tipo === 'cadastro') {
      percentual = 100; // 100% no primeiro cadastro
      comissao = calcular_comissao_cadastro(valor, percentual);
    } else if (tipo === 'recorrente') {
      percentual = 5; // 5% mensal
      comissao = calcular_comissao_recorrente(valor, percentual);
    } else {
      return NextResponse.json({ error: 'Invalid commission type' }, { status: 400 });
    }

    // Criar registro de comissão
    const { data: comissaoData, error: comissaoError } = await supabase
      .from('comissoes')
      .insert({
        embaixador_id: userId,
        cliente_id: userId, // Substituir pelo ID real do cliente
        lead_id: leadId,
        valor_comissao: comissao,
        percentual,
        tipo_comissao: tipo,
        status_pagamento: 'pendente',
        mes_referencia: new Date().getMonth() + 1,
        ano_referencia: new Date().getFullYear(),
      })
      .select()
      .single();

    if (comissaoError) {
      throw comissaoError;
    }

    // Atualizar estatísticas do embaixador
    await supabase
      .from('profiles')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      comissao: comissaoData,
      message: `Comissão de R$ ${comissao.toFixed(2)} criada com sucesso!`
    });

  } catch (error) {
    console.error('Error creating commission:', error);
    return NextResponse.json(
      { error: 'Failed to create commission' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = supabase
      .from('comissoes')
      .select(`
        *,
        profiles:embaixador_id (nome, email),
        cliente:cliente_id (nome, email)
      `);

    if (userId) {
      query = query.eq('embaixador_id', userId);
    }

    if (status) {
      query = query.eq('status_pagamento', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calcular totais
    const totais = {
      totalPendente: data
        .filter(c => c.status_pagamento === 'pendente')
        .reduce((sum, c) => sum + c.valor_comissao, 0),
      totalPago: data
        .filter(c => c.status_pagamento === 'pago')
        .reduce((sum, c) => sum + c.valor_comissao, 0),
      totalCancelado: data
        .filter(c => c.status_pagamento === 'cancelado')
        .reduce((sum, c) => sum + c.valor_comissao, 0),
    };

    return NextResponse.json({
      success: true,
      comissoes: data,
      totais,
    });

  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}