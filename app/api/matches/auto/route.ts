import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // 1. Buscar todos os consumidores aguardando match
    const { data: consumidores, error: errConsumidores } = await supabase
      .from('consumidores')
      .select('*, profiles(nome, email, whatsapp)')
      .eq('status', 'aguardando');

    if (errConsumidores) throw errConsumidores;

    // 2. Buscar todos os geradores disponíveis
    const { data: geradores, error: errGeradores } = await supabase
      .from('geradores')
      .select('*, profiles(nome, email, whatsapp)')
      .eq('status', 'disponivel')
      .gt('excedente_mensal_kwh', 0);

    if (errGeradores) throw errGeradores;

    const matchesCriados = [];

    // 3. Para cada consumidor, tentar encontrar um gerador compatível
    for (const consumidor of consumidores) {
      // Encontrar gerador na mesma concessionária e com excedente suficiente
      const geradorCompativel = geradores.find(g => 
        g.concessionaria === consumidor.concessionaria && 
        g.excedente_mensal_kwh >= consumidor.consumo_mensal_kwh
      );

      if (geradorCompativel) {
        // Calcular valor do match
        const valorMensal = consumidor.consumo_mensal_kwh * geradorCompativel.preco_por_kwh;

        // Criar o match
        const { data: match, error: errMatch } = await supabase
          .from('matches')
          .insert({
            consumidor_id: consumidor.id,
            gerador_id: geradorCompativel.id,
            kwh_mensal: consumidor.consumo_mensal_kwh,
            valor_mensal: valorMensal,
            status: 'ativo',
            data_inicio: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();

        if (errMatch) throw errMatch;

        // Atualizar status do consumidor
        await supabase
          .from('consumidores')
          .update({ status: 'conectado' })
          .eq('id', consumidor.id);

        // Reduzir excedente do gerador
        await supabase
          .from('geradores')
          .update({ 
            excedente_mensal_kwh: geradorCompativel.excedente_mensal_kwh - consumidor.consumo_mensal_kwh 
          })
          .eq('id', geradorCompativel.id);

        matchesCriados.push(match);

        // Remover gerador da lista para não ser usado novamente
        const index = geradores.indexOf(geradorCompativel);
        geradores.splice(index, 1);
      }
    }

    return NextResponse.json({ 
      success: true, 
      matches: matchesCriados,
      total: matchesCriados.length 
    });

  } catch (error) {
    console.error('Erro no match automático:', error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}