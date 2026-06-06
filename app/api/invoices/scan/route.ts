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

    const insert = {
      user_id: user.id,
      uploaded_by_role: isEmbaixador ? 'embaixador' : 'consumidor',
      cliente_nome: data.clienteNome || null,
      cliente_whatsapp: data.clienteWhatsapp || null,
      file_url: placeholderUrl,
      file_name: data.fileName || `scan-${parsedBarcode.tipo}-${Date.now()}`,
      file_type: parsedBarcode.tipo === 'qrcode' ? 'qrcode' : 'barcode',
      status: 'analyzed' as const,
      valor_total: parsedBarcode.valor,
      kwh_mensal: kwhEstimado,
      vencimento: parsedBarcode.vencimento,
      raw_extraction: parsedBarcode as any,
      match_eligible: matchEligible,
      match_eligible_at: matchEligible ? new Date().toISOString() : null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      endereco: data.endereco ?? null,
      barcode_payload: data.barcodePayload,
      barcode_type: parsedBarcode.tipo,
      source: 'scan' as const,
    }

    const { data: created, error } = await (supabase
      .from('invoice_uploads')
      .insert(insert as any)
      .select('id, kwh_mensal, match_eligible, valor_total, vencimento')
      .single() as any)

    if (error) {
      console.error('[invoices/scan] insert error:', error)
      return NextResponse.json({ error: 'Erro ao salvar fatura escaneada' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      invoice: created,
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
 * Estimativa de kWh a partir do valor (R$ 0,95/kWh é a referência)
 * Apenas fallback - usuário pode corrigir
 */
function estimateKwhFromValor(valor: number): number {
  return Math.round(valor / 0.95)
}
