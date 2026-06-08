import { createClient } from '@/lib/supabase/server'

export interface ExcedenteResult {
  success: boolean
  error?: string
  geracao_estimada?: number
  consumo?: number
  excedente?: number
  preco_kwh?: number
  preco_total?: number
  oferta_id?: string
  kwh_disponivel?: number
}

/**
 * Calcula a geração estimada de uma usina baseado na capacidade instalada.
 * Fórmula: kWp × 120 kWh/kWp (média nacional de irradiação)
 */
export function calcularGeracaoMensal(capacidadeKwp: number): number {
  return capacidadeKwp * 120
}

/**
 * Calcula o excedente: geração - consumo
 * Retorna 0 se consumo >= geração (sem excedente)
 */
export function calcularExcedente(geracaoMensal: number, consumoKwh: number): number {
  return Math.max(geracaoMensal - consumoKwh, 0)
}

/**
 * Calcula o preço do kWh para oferta de excedente.
 * Estratégia: 75% da tarifa nacional de referência (R$ 0,95)
 * para ser competitivo, mas nunca abaixo do preço mínimo do gerador.
 */
export function calcularPrecoKwh(precoKwhGerador?: number): number {
  const tarifaReferencia = 0.95
  const precoCompetitivo = 0.75 * tarifaReferencia
  if (precoKwhGerador && precoKwhGerador > 0) {
    return Math.max(precoCompetitivo, precoKwhGerador)
  }
  return precoCompetitivo
}

/**
 * Cria uma oferta de excedente no banco via RPC (contratar_oferta SQL function).
 * Retorna os dados da oferta criada ou erro.
 */
export async function criarOfertaExcedente(
  geradorId: string,
  consumoKwh: number,
  invoiceId?: string,
): Promise<ExcedenteResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('calcular_excedente_e_ofertar', {
    p_gerador_id: geradorId,
    p_consumo_kwh: consumoKwh,
    p_invoice_id: invoiceId || null,
  })

  if (error) {
    console.error('[excedente] RPC error:', error)
    return { success: false, error: error.message }
  }

  return (data || { success: false, error: 'Resposta vazia' }) as ExcedenteResult
}

/**
 * Lista ofertas de excedente disponíveis para consumidores.
 */
export async function listarOfertasDisponiveis() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ofertas_excedente')
    .select(`
      *,
      gerador:gerador_id (
        nome_usina,
        concessionaria,
        cidade,
        estado,
        capacidade_kwp,
        profiles!geradores_id_fkey(nome, whatsapp)
      )
    `)
    .eq('status', 'ativa')
    .gte('expires_at', new Date().toISOString())
    .order('preco_kwh', { ascending: true })

  if (error) {
    console.error('[excedente] list error:', error)
    return []
  }

  return data || []
}

/**
 * Contrata uma oferta de excedente (consumidor aceita).
 */
export async function contratarOferta(ofertaId: string, consumidorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('contratar_oferta', {
    p_oferta_id: ofertaId,
    p_consumidor_id: consumidorId,
  })

  if (error) {
    console.error('[excedente] contract error:', error)
    return { success: false, error: error.message }
  }

  return (data || { success: false, error: 'Resposta vazia' }) as ExcedenteResult
}
