import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export const WHATSAPP_NUMBER = '5584987858668'
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`

export type LeadTipo = 'consumidor' | 'gerador' | 'parceiro'

export interface LeadConsumidorInput {
  tipo: 'consumidor'
  nome: string
  email: string
  whatsapp: string
  cidade: string
  estado: string
  gastoMensal: number
}

export interface LeadGeradorInput {
  tipo: 'gerador'
  nome: string
  email: string
  whatsapp: string
  cidade: string
  estado: string
  capacidadeKwp: number
  concessionaria?: string
  cargo?: string
}

export interface LeadParceiroInput {
  tipo: 'parceiro'
  nome: string
  email: string
  whatsapp: string
  cidade: string
  estado: string
  nicho?: string
  audienciaEstimada?: number
  canal?: string
}

export type LeadInput = LeadConsumidorInput | LeadGeradorInput | LeadParceiroInput

export type LeadInsert = Database['public']['Tables']['leads']['Insert']

export interface LeadValidationOk {
  ok: true
  data: LeadInput
}

export interface LeadValidationErr {
  ok: false
  message: string
  field?: keyof LeadInput | string
}

export type LeadValidation = LeadValidationOk | LeadValidationErr

export interface LeadResult {
  success: boolean
  id?: number
  message?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?\d{10,15}$/

function normalizePhone(raw: string): string {
  const trimmed = raw.trim()
  const plus = trimmed.startsWith('+') ? '+' : ''
  const digits = trimmed.replace(/\D/g, '')
  return `${plus}${digits}`
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/\s+/g, '').replace(',', '.')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function validateLead(raw: unknown): LeadValidation {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, message: 'Dados do lead inválidos' }
  }
  const r = raw as Record<string, unknown>

  const nome = String(r.nome ?? '').trim()
  const email = String(r.email ?? '').trim()
  const whatsapp = normalizePhone(String(r.whatsapp ?? ''))
  const cidade = String(r.cidade ?? '').trim()
  const estado = String(r.estado ?? '').trim()

  if (!nome) return { ok: false, message: 'Nome é obrigatório', field: 'nome' }
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, message: 'Email inválido', field: 'email' }
  }
  if (!whatsapp || !PHONE_RE.test(whatsapp)) {
    return { ok: false, message: 'WhatsApp inválido (use DDI + DDD + número)', field: 'whatsapp' }
  }
  if (!cidade) return { ok: false, message: 'Cidade é obrigatória', field: 'cidade' }
  if (!estado || estado.length !== 2) {
    return { ok: false, message: 'Estado (UF) é obrigatório', field: 'estado' }
  }

  const tipo = r.tipo
  if (tipo === 'consumidor') {
    const gastoMensal = toNumber(r.gastoMensal)
    if (gastoMensal === null || gastoMensal <= 0) {
      return { ok: false, message: 'Gasto mensal inválido', field: 'gastoMensal' }
    }
    return {
      ok: true,
      data: { tipo: 'consumidor', nome, email, whatsapp, cidade, estado, gastoMensal },
    }
  }
  if (tipo === 'gerador') {
    const capacidadeKwp = toNumber(r.capacidadeKwp)
    if (capacidadeKwp === null || capacidadeKwp <= 0) {
      return { ok: false, message: 'Capacidade (kWp) inválida', field: 'capacidadeKwp' }
    }
    const concessionaria =
      typeof r.concessionaria === 'string' && r.concessionaria.trim()
        ? r.concessionaria.trim()
        : undefined
    const cargo =
      typeof r.cargo === 'string' && r.cargo.trim() ? r.cargo.trim() : undefined
    return {
      ok: true,
      data: {
        tipo: 'gerador',
        nome,
        email,
        whatsapp,
        cidade,
        estado,
        capacidadeKwp,
        concessionaria,
        cargo,
      },
    }
  }
  if (tipo === 'parceiro') {
    const nicho =
      typeof r.nicho === 'string' && r.nicho.trim() ? r.nicho.trim() : undefined
    const canal =
      typeof r.canal === 'string' && r.canal.trim() ? r.canal.trim() : undefined
    const audienciaRaw = r.audienciaEstimada ?? r.audiencia_estimada
    const audienciaEstimada =
      audienciaRaw === undefined || audienciaRaw === null || audienciaRaw === ''
        ? undefined
        : toNumber(audienciaRaw) ?? undefined
    return {
      ok: true,
      data: {
        tipo: 'parceiro',
        nome,
        email,
        whatsapp,
        cidade,
        estado,
        nicho,
        audienciaEstimada,
        canal,
      },
    }
  }
  return { ok: false, message: 'Tipo de lead inválido', field: 'tipo' }
}

export function buildLeadRow(input: LeadInput, userId?: string | null): LeadInsert {
  const base = {
    nome: input.nome,
    email: input.email,
    whatsapp: input.whatsapp,
    cidade: input.cidade,
    estado: input.estado.toUpperCase(),
    tipo: input.tipo,
    user_id: userId ?? null,
  }
  if (input.tipo === 'consumidor') {
    return {
      ...base,
      gasto_mensal: input.gastoMensal,
      capacidade_kwp: null,
      concessionaria: null,
      nicho: null,
      audiencia_estimada: null,
      canal: null,
    }
  }
  if (input.tipo === 'gerador') {
    return {
      ...base,
      gasto_mensal: null,
      capacidade_kwp: input.capacidadeKwp,
      concessionaria: input.concessionaria ?? null,
      nicho: null,
      audiencia_estimada: null,
      canal: null,
    }
  }
  return {
    ...base,
    gasto_mensal: null,
    capacidade_kwp: null,
    concessionaria: null,
    nicho: input.nicho ?? null,
    audiencia_estimada: input.audienciaEstimada ?? null,
    canal: input.canal ?? null,
  }
}

export interface CaptureLeadDeps {
  supabase: SupabaseClient<any, any, any>
  userId?: string | null
  insert?: (row: LeadInsert | LeadInsert[]) => Promise<{ data: any; error: any }>
}

async function defaultInsert(
  supabase: SupabaseClient<any, any, any>,
  row: LeadInsert,
): Promise<{ data: any; error: any }> {
  try {
    const result = await supabase.from('leads').insert(row as any)
    return { data: (result as any)?.data, error: (result as any)?.error }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('schema cache')) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const res = await fetch(`${url}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(row),
      })
      if (!res.ok) {
        const text = await res.text()
        return { data: null, error: text }
      }
      const data = await res.json()
      return { data, error: null }
    }
    return { data: null, error: msg }
  }
}

export async function captureLead(
  raw: unknown,
  deps: CaptureLeadDeps,
): Promise<LeadResult> {
  const validation = validateLead(raw)
  if (!validation.ok) {
    return { success: false, message: validation.message }
  }
  const row = buildLeadRow(validation.data, deps.userId)
  try {
    const exec = deps.insert
      ? (r: LeadInsert) => deps.insert!(r as LeadInsert | LeadInsert[])
      : (r: LeadInsert) => defaultInsert(deps.supabase, r)
    const { data, error } = await exec(row)
    if (error) {
      return { success: false, message: error.message ?? 'Erro ao salvar lead' }
    }
    const id = Array.isArray(data) ? data[0]?.id : (data as any)?.id
    return { success: true, id: typeof id === 'number' ? id : undefined }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

function fmtBRL(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function sanitize(message: string): string {
  return message.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim()
}

export function buildWhatsAppMessage(lead: LeadInput): string {
  const nome = lead.nome.split(' ')[0] || lead.nome
  if (lead.tipo === 'consumidor') {
    return sanitize(
      `Olá! Sou ${nome}, acabei de preencher a análise gratuita de economia. ` +
        `Meu gasto mensal é R$ ${fmtBRL(lead.gastoMensal)} em ${lead.cidade}/${lead.estado}. ` +
        `Quero economizar com energia solar.`,
    )
  }
  if (lead.tipo === 'gerador') {
    return sanitize(
      `Olá! Sou ${nome}, tenho uma usina de ${fmtBRL(lead.capacidadeKwp)} kWp em ` +
        `${lead.cidade}/${lead.estado} e quero monetizar meu excedente pela EnergiaLivre.`,
    )
  }
  const nicho = lead.nicho ? ` Atuo com ${lead.nicho}.` : ''
  return sanitize(
    `Olá! Sou ${nome}, quero ser parceiro da EnergiaLivre e indicar energia solar.` +
      ` Minha base é em ${lead.cidade}/${lead.estado}.${nicho}`,
  )
}

export function buildWhatsAppUrl(lead: LeadInput): string {
  const text = encodeURIComponent(buildWhatsAppMessage(lead))
  return `${WHATSAPP_BASE}?text=${text}`
}

export interface FollowUpContext {
  nome?: string
  cidade?: string
  estado?: string
  capacidadeKwp?: number
}

export function buildFollowUpMessage(
  tipo: LeadTipo,
  ctx: FollowUpContext = {},
): string {
  const firstName = (ctx.nome?.split(' ')[0] || '').trim() || 'cliente'
  const cidade = (ctx.cidade || '').trim() || 'minha região'
  if (tipo === 'consumidor') {
    return sanitize(
      `Olá! Sou ${firstName}, acabei de fazer a análise na EnergiaLivre e quero enviar ` +
        `minha fatura para acelerar o processo. Cidade: ${cidade}.`,
    )
  }
  if (tipo === 'gerador') {
    const cap = ctx.capacidadeKwp && ctx.capacidadeKwp > 0
      ? `${fmtBRL(ctx.capacidadeKwp)} kWp`
      : 'N/I'
    const estado = (ctx.estado || '').trim().toUpperCase() || 'N/I'
    return sanitize(
      `Olá! Sou ${firstName}, acabei de cadastrar minha usina na EnergiaLivre e quero enviar ` +
        `os documentos para acelerar a monetização. Capacidade: ${cap} | Estado: ${estado}.`,
    )
  }
  return sanitize(
    `Olá! Sou ${firstName}, acabei de me cadastrar como parceiro da EnergiaLivre e quero ` +
      `saber como começar a indicar. Minha base é em ${cidade}.`,
  )
}

export function buildFollowUpUrl(tipo: LeadTipo, ctx: FollowUpContext = {}): string {
  const text = encodeURIComponent(buildFollowUpMessage(tipo, ctx))
  return `${WHATSAPP_BASE}?text=${text}`
}

const UF_PATTERN = /\b([A-Z]{2})\b/

export function splitCidadeEstado(rawCidade: string): { cidade: string; estado: string } {
  const value = (rawCidade || '').trim()
  if (!value) return { cidade: '', estado: '' }
  const match = value.match(UF_PATTERN)
  if (!match) return { cidade: value, estado: '' }
  const idx = match.index ?? 0
  const cidade = value.slice(0, idx).replace(/[-\s,/.]+$/, '').trim() || value
  return { cidade, estado: match[1] }
}
