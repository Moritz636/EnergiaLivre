import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BUCKET = 'invoices'
const MAX_SIZE = 10 * 1024 * 1024

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data, error } = await supabase
      .from('invoice_uploads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json({ success: true, invoices: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  } catch (err) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const clienteNome = (formData.get('cliente_nome') as string | null) ?? null
    const clienteWhatsapp = (formData.get('cliente_whatsapp') as string | null) ?? null
    const uploadedByRole = (formData.get('uploaded_by_role') as string | null) ?? 'consumidor'

    if (!file) {
      return NextResponse.json({ error: 'Arquivo obrigatório' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: `Arquivo muito grande (máx 10MB). Recebido: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
      }, { status: 413 })
    }

    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 60)
    const path = `${user.id}/${Date.now()}-${safeName}`

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadErr) throw uploadErr

    const { data: row, error: insertErr } = await (supabase
      .from('invoice_uploads') as any)
      .insert({
        user_id: user.id,
        uploaded_by_role: uploadedByRole,
        cliente_nome: clienteNome,
        cliente_whatsapp: clienteWhatsapp,
        file_url: path,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        status: 'pending',
      })
      .select('*')
      .single()

    if (insertErr) throw insertErr

    return NextResponse.json({ success: true, invoice: row })
  } catch (err: any) {
    console.error('POST /api/invoices error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
