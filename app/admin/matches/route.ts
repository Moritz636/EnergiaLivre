// app/api/matches/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');

  try {
    if (tipo === 'consumidores') {
      const { data, error } = await supabase
        .from('consumidores')
        .select('*, profiles(nome, email, whatsapp)')
        .eq('status', 'aguardando');
      
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
    
    if (tipo === 'geradores') {
      const { data, error } = await supabase
        .from('geradores')
        .select('*, profiles(nome, email, whatsapp)')
        .eq('status', 'disponivel');
      
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
    
    if (tipo === 'matches') {
      const { data, error } = await supabase
        .from('matches')
        .select('*, consumidor:consumidores(profiles(nome)), gerador:geradores(profiles(nome))')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Tipo inválido' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();
  const { consumidor_id, gerador_id, kwh_mensal } = body;

  try {
    const { data: gerador } = await supabase
      .from('geradores')
      .select('preco_por_kwh')
      .eq('id', gerador_id)
      .single();

    const valor_mensal = kwh_mensal * (gerador?.preco_por_kwh || 0.32);

    const { data, error } = await supabase
      .from('matches')
      .insert({
        consumidor_id,
        gerador_id,
        kwh_mensal,
        valor_mensal,
        status: 'ativo',
        data_inicio: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('consumidores')
      .update({ status: 'conectado' })
      .eq('id', consumidor_id);

    const { data: geradorAtual } = await supabase
      .from('geradores')
      .select('excedente_mensal_kwh')
      .eq('id', gerador_id)
      .single();

    await supabase
      .from('geradores')
      .update({ excedente_mensal_kwh: geradorAtual.excedente_mensal_kwh - kwh_mensal })
      .eq('id', gerador_id);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) });
  }
}