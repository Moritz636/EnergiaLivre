import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const WHATSAPP_NUMBER = '5584987858668';

interface AnellValidationResult {
  anell_protocolo?: string;
  status?: string;
  score?: number;
  aprovado?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, distribuidora, consumoKwh, nome, whatsapp, email } = body;

    if (!leadId || !distribuidora || !consumoKwh) {
      return NextResponse.json({ error: 'Campos obrigatórios: leadId, distribuidora, consumoKwh' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await (supabase as any).rpc('validate_usina_anell', {
      p_lead_id: leadId,
      p_distribuidora: distribuidora,
      p_consumo_kwh: consumoKwh,
    });

    if (error) {
      console.error('ANELL validation error:', error);
      return NextResponse.json({ error: 'Erro na validação ANELL' }, { status: 500 });
    }

    const result = data as unknown as AnellValidationResult;

    const msg = encodeURIComponent(
      `Nova usina cadastrada para validação ANELL:%0A%0A` +
      `Nome: ${nome || 'N/D'}%0A` +
      `Email: ${email || 'N/D'}%0A` +
      `WhatsApp: ${whatsapp || 'N/D'}%0A` +
      `Distribuidora: ${distribuidora}%0A` +
      `Consumo: ${consumoKwh} kWh%0A` +
      `Protocolo ANELL: ${result?.anell_protocolo || 'N/D'}%0A` +
      `Status: ${result?.status || 'pendente'}%0A` +
      `Score: ${result?.score ?? 'N/D'}%0A` +
      `%0AAcesse o painel admin para revisão: https://energialivre.dev.br/admin/dashboard`
    );

    fetch(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`).catch(() => {});

    const aprovado = result?.status === 'aprovado' || result?.aprovado === true;

    await (supabase as any)
      .from('leads')
      .update({
        anell_validated: aprovado,
        anell_validated_at: new Date().toISOString(),
        anell_data: result,
        match_ready: aprovado,
        status: aprovado ? 'aprovado' : 'pendente',
      })
      .eq('id', leadId);

    return NextResponse.json({
      success: true,
      validation: result,
      message: 'Usina validada com sucesso' + (aprovado ? '. Disponível para match!' : '. Documentação pendente.'),
    });
  } catch (err: any) {
    console.error('ANELL route error:', err);
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}
