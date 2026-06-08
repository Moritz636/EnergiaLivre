import { NextRequest, NextResponse } from 'next/server'
import { v } from '@/lib/validation'
import { createClient } from '@/lib/supabase/server'
import { parseBarcode } from '@/lib/barcode-parser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/invoices/scan
 *
 * Recebe um código de barras / QR code de fatura (escaneado pela câmera),
 * valida os dados, e cria um registro de `invoice_uploads` (sem arquivo
 * físico, source='scan'). Se a fatura tiver kwh_mensal >= 300, marca
 * match_eligible=true e o cliente aparece automaticamente no mapa de match.
 *
 * Body:
 *   - barcodePayload: string (linha digitável / QR / ITF)
 *   - latitude?: number
 *   - longitude?: number
 *   - endereco?: string
 *   - fileName?: string (default: 'scan-{txid}.png')
 *   - clienteNome?: string (apenas embaixador)
 *   - clienteWhatsapp?: string (apenas embaixador)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const json = await request.json().catch(() => ({}))
    const parsed = v.object(json, {
      barcodePayload: (i) => v.string(i, { min: 5, max: 2000 }),
      latitude: v.optional((i) => v.number(i, { min: -90, max: 90 })),
      longitude: v.optional((i) => v.number(i, { min: -180, max: 180 })),
      endereco: v.optional((i) => v.string(i, { max: 200 })),
      fileName: v.optional((i) => v.string(i, { max: 200 })),
      clienteNome: v.optional((i) => v.string(i, { max: 120 })),
      clienteWhatsapp: v.optional((i) => v.string(i, { max: 30 })),
    })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const data = parsed.data

    const parsedBarcode = parseBarcode(data.barcodePayload)
    if (parsedBarcode.confidence === 'nenhum' || parsedBarcode.valor === null) {
      return NextResponse.json({
        error: 'Não foi possível extrair valor da fatura a partir deste código.',
        parsed: parsedBarcode,
      }, { status: 422 })
    }

    const isEmbaixador = (await supabase
      .from('profiles')
      .select('tipo')
      .eq('id', user.id)
      .single() as any)?.data?.tipo === 'parceiro'

    // file_url vazio (fatura escaneada não tem upload, mas coluna é NOT NULL)
    const placeholderUrl = `scan://${parsedBarcode.tipo}/${parsedBarcode.documentId ?? parsedBarcode.txid ?? 'unknown'}`

    // Sem kWh extraído: usamos heurística - se tem valor e vencimento, estimar 200 kWh mínimo
    // (UI de revisão manual após)
    const kwhEstimado = estimateKwhFromValor(parsedBarcode.valor)

    const matchEligible = kwhEstimado >= 300

    // Base columns (existem na tabela original 20260109)
    const baseInsert: Record<string, unknown> = {
      user_id: user.id,
      uploaded_by_role: isEmbaixador ? 'embaixador' : 'consumidor',
      cliente_nome: data.clienteNome || null,
      cliente_whatsapp: data.clienteWhatsapp || null,
      file_url: placeholderUrl,
      file_name: data.fileName || `scan-${parsedBarcode.tipo}-${Date.now()}`,
      file_type: parsedBarcode.tipo === 'qrcode' ? 'qrcode' : 'barcode',
      status: 'analyzed',
      valor_total: parsedBarcode.valor,
      kwh_mensal: kwhEstimado,
      vencimento: parsedBarcode.vencimento,
      raw_extraction: {
        ...parsedBarcode,
        barcode_payload: data.barcodePayload,
        source: 'scan',
        match_eligible: matchEligible,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        endereco: data.endereco ?? null,
      },
    }

    // Tenta insert com colunas extras (migration 20260606 pode existir)
    const extraInsert = {
      ...baseInsert,
      match_eligible: matchEligible,
      match_eligible_at: matchEligible ? new Date().toISOString() : null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      endereco: data.endereco ?? null,
      barcode_payload: data.barcodePayload,
      barcode_type: parsedBarcode.tipo,
      source: 'scan',
    }

    // Tenta com colunas extras primeiro; fallback para base se coluna faltar
    const insertResult = await tryInsertInvoice(supabase, extraInsert, baseInsert, ['match_eligible'])
    if (!insertResult.success) {
      console.error('[invoices/scan] insert error:', insertResult.error)
      return NextResponse.json({ error: 'Erro ao salvar fatura escaneada' }, { status: 500 })
    }
    const created = insertResult.data

    return NextResponse.json({
      success: true,
      invoice: { ...created, match_eligible: matchEligible },
      parsed: parsedBarcode,
      message: matchEligible
        ? 'Fatura cadastrada. Consumo estimado ≥ 300 kWh — você aparece no mapa de match!'
        : 'Fatura cadastrada. Confirme o consumo real na próxima tela para aparecer no mapa.',
    })
  } catch (err: any) {
    console.error('[invoices/scan] exception:', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}

/**
 * Tenta inserir com colunas extras; se falhar por coluna inexistente,
 * faz fallback para apenas colunas base (sem as adicionadas na migration 20260606).
 */
async function tryInsertInvoice(
  supabase: any,
  extraInsert: Record<string, unknown>,
  baseInsert: Record<string, unknown>,
  selectFields: string[],
): Promise<{ success: true; data: any } | { success: false; error: any }> {
  const fields = ['id', 'kwh_mensal', 'valor_total', 'vencimento', ...selectFields]
  const uniqueFields = [...new Set(fields)]

  // Tenta insert completo primeiro
  const { data, error } = await supabase
    .from('invoice_uploads')
    .insert(extraInsert)
    .select(uniqueFields.join(','))
    .single()

  if (!error) return { success: true, data }

  // Se erro for coluna inexistente, fallback para base apenas
  const msg = (error?.message || '').toLowerCase()
  if ((msg.includes('column') || msg.includes('coluna')) && msg.includes('exist')) {
    const { data: baseData, error: baseError } = await supabase
      .from('invoice_uploads')
      .insert(baseInsert)
      .select('id, kwh_mensal, valor_total, vencimento')
      .single()
    if (baseError) return { success: false, error: baseError }
    return { success: true, data: baseData }
  }

  return { success: false, error }
}

/**
 * Estimativa de kWh a partir do valor (R$ 0,95/kWh é a referência)
 * Apenas fallback - usuário pode corrigir
 */
function estimateKwhFromValor(valor: number): number {
  return Math.round(valor / 0.95)
}
