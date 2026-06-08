import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const json = await request.json();
    const id = json.id as string;
    const action = json.action as string;

    if (!id || !action) {
      return NextResponse.json({ error: 'id e action são obrigatórios' }, { status: 400 });
    }

    if (action === 'approve') {
      const { error } = await supabase
        .from('geradores')
        .update({ status: 'aprovado', data_aprovacao: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, status: 'aprovado' });
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('geradores')
        .update({ status: 'inativo', data_aprovacao: null })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, status: 'inativo' });
    }

    return NextResponse.json({ error: 'action inválida. Use "approve" ou "reject".' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pendente';

    const { data, error } = await supabase
      .from('geradores')
      .select('*, profiles!geradores_id_fkey(nome, email, whatsapp, cidade, estado)')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
