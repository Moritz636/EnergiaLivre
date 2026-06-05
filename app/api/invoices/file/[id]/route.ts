import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const { data: inv, error: invErr } = await supabase
      .from('invoice_uploads')
      .select('file_url, file_name, file_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (invErr) throw invErr
    if (!inv) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })

    // Gerar URL assinada (bucket privado)
    const { data: signed, error: signErr } = await supabase.storage
      .from('invoices')
      .createSignedUrl(inv.file_url, 600) // 10 min

    if (signErr) throw signErr
    if (!signed?.signedUrl) return NextResponse.json({ error: 'URL inválida' }, { status: 500 })

    // Redirecionar para a URL assinada
    return NextResponse.redirect(signed.signedUrl)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
