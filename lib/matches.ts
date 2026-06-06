// ============================================
// MATCHES - DESCOBERTA DE CANDIDATOS + PROPOSTAS
// ============================================
// Usado por:
//   - app/api/matches/route.ts (GET candidates)
//   - app/api/matches/propose/route.ts (POST proposal)
//   - app/api/matches/respond/route.ts (POST response)
//   - app/dashboard/match/page.tsx (UI)
// ============================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { calculateDistance, type Coordinates } from '@/lib/geolocation'

export type TargetTipo = 'consumidor' | 'gerador'

/**
 * Modo de descoberta de matches:
 * - radius: busca por proximidade geografica (default, UX Tinder)
 * - state: busca todos os geradores do mesmo estado (mesma UF, qualquer distancia)
 * - distributor: busca geradores da mesma distribuidora (sistema de compensacao igual)
 */
export type MatchMode = 'radius' | 'state' | 'distributor'

export interface MatchCandidate {
  user_id: string
  nome: string
  cidade: string
  estado: string
  lat: number
  lng: number
  distance_km: number
  tipo: TargetTipo
  is_member_plus: boolean
  // Novos campos de ranking
  preco_kwh?: number | null
  desconto_percentual?: number | null
  pacote_kwh?: number | null
  pacote_preco?: number | null
  ranking_score?: number | null
  total_avaliacoes?: number | null
  media_avaliacoes?: number | null
  // Match por distribuidora
  concessionaria?: string | null
}

export interface MatchProposalRecord {
  id: number
  from_user_id: string
  to_user_id: string
  gerador_id: string | null
  consumidor_id: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
  message: string | null
  expires_at: string
  responded_at: string | null
  created_at: string
  updated_at: string
}

export type MatchProposalStatus = MatchProposalRecord['status']

export interface FindCandidatesInput {
  userId: string
  origin: Coordinates
  targetTipo: TargetTipo
  radiusKm?: number
  limit?: number
  /** Modo de busca (default: radius) */
  mode?: MatchMode
  /** Obrigatorio para mode='state' (UF do usuario) */
  estadoFilter?: string
  /** Obrigatorio para mode='distributor' (nome da distribuidora) */
  distribuidoraFilter?: string
}

export interface FindCandidatesDeps {
  supabase: SupabaseClient<Database>
  fetchLocations?: (
    userId: string,
    targetTipo: TargetTipo,
    mode: MatchMode,
    estadoFilter?: string,
    distribuidoraFilter?: string,
  ) => Promise<Array<{
    user_id: string
    lat: number
    lng: number
    cidade: string
    estado: string
    nome: string
    tipo: TargetTipo
    member_plus_active: boolean
    preco_kwh?: number | null
    desconto_percentual?: number | null
    pacote_kwh?: number | null
    pacote_preco?: number | null
    ranking_score?: number | null
    total_avaliacoes?: number | null
    media_avaliacoes?: number | null
    concessionaria?: string | null
  }>>
}

export async function findCandidates(
  input: FindCandidatesInput,
  deps: FindCandidatesDeps,
): Promise<MatchCandidate[]> {
  const mode: MatchMode = input.mode ?? 'radius'
  const radius = input.radiusKm ?? 50
  const limit = input.limit ?? 50

  const fetcher = deps.fetchLocations
    ? deps.fetchLocations
    : async (
        userId: string,
        targetTipo: TargetTipo,
        modeParam: MatchMode,
        estadoFilter?: string,
        distribuidoraFilter?: string,
      ) => {
        // Para mode='distributor', precisamos fazer join com geradores para filtrar por concessionaria
        // Para mode='state', filtramos no client depois (pq user_locations.estado e geradores.estado
        // podem divergir - usamos user_locations.estado para o match)
        let q = deps.supabase
          .from('user_locations')
          .select(`
            user_id,
            lat,
            lng,
            cidade,
            estado,
            profiles!inner(nome, tipo, is_active, member_plus_active),
            geradores!left(preco_kwh, desconto_percentual, pacote_kwh, pacote_preco, ranking_score, total_avaliacoes, media_avaliacoes, status, concessionaria)
          `)
          .eq('profiles.tipo', targetTipo)
          .neq('user_id', userId)

        if (modeParam === 'state' && estadoFilter) {
          q = q.ilike('estado', estadoFilter.toUpperCase())
        }

        const result = await (q as any)
        const rows = (result?.data ?? []) as Array<any>
        return rows
          .map((r) => {
            const g = r.geradores
            const isGeradorAtivo = g && g.status === 'ativo'
            return {
              user_id: r.user_id,
              lat: r.lat,
              lng: r.lng,
              cidade: r.cidade,
              estado: r.estado,
              nome: (r.profiles?.nome as string) ?? 'Usuário',
              tipo: ((r.profiles?.tipo as TargetTipo) ?? targetTipo),
              member_plus_active: !!(r.profiles?.member_plus_active),
              preco_kwh: isGeradorAtivo ? (g.preco_kwh ?? null) : null,
              desconto_percentual: isGeradorAtivo ? (g.desconto_percentual ?? null) : null,
              pacote_kwh: isGeradorAtivo ? (g.pacote_kwh ?? null) : null,
              pacote_preco: isGeradorAtivo ? (g.pacote_preco ?? null) : null,
              ranking_score: isGeradorAtivo ? (g.ranking_score ?? null) : null,
              total_avaliacoes: isGeradorAtivo ? (g.total_avaliacoes ?? null) : null,
              media_avaliacoes: isGeradorAtivo ? (g.media_avaliacoes ?? null) : null,
              concessionaria: isGeradorAtivo ? (g.concessionaria ?? null) : null,
            }
          })
          .filter((r) => {
            if (modeParam === 'distributor' && distribuidoraFilter) {
              return r.concessionaria?.toLowerCase() === distribuidoraFilter.toLowerCase()
            }
            return true
          })
      }

  const rows = await fetcher(
    input.userId,
    input.targetTipo,
    mode,
    input.estadoFilter,
    input.distribuidoraFilter,
  )

  const candidates: MatchCandidate[] = rows
    .filter((r) => r.tipo === input.targetTipo && r.user_id !== input.userId)
    .map((r) => {
      const distanceKm = calculateDistance(input.origin, { lat: r.lat, lng: r.lng })
      return {
        user_id: r.user_id,
        nome: r.nome,
        cidade: r.cidade,
        estado: r.estado,
        lat: r.lat,
        lng: r.lng,
        distance_km: distanceKm,
        tipo: r.tipo,
        is_member_plus: r.member_plus_active,
        preco_kwh: r.preco_kwh ?? null,
        desconto_percentual: r.desconto_percentual ?? null,
        pacote_kwh: r.pacote_kwh ?? null,
        pacote_preco: r.pacote_preco ?? null,
        ranking_score: r.ranking_score ?? null,
        total_avaliacoes: r.total_avaliacoes ?? null,
        media_avaliacoes: r.media_avaliacoes ?? null,
        concessionaria: r.concessionaria ?? null,
      }
    })
    .filter((c) => {
      // radius: filtra por distancia. state e distributor: ignora distancia.
      if (mode === 'radius') return c.distance_km <= radius
      return true
    })

  // Ordenacao
  // - radius: ranking_score desc, depois distancia asc
  // - state/distributor: ranking_score desc (distancia vira tie-breaker)
  const sorted = candidates.sort((a, b) => {
    if (a.tipo === 'gerador' && b.tipo === 'gerador') {
      const scoreDiff = (b.ranking_score ?? 0) - (a.ranking_score ?? 0)
      if (Math.abs(scoreDiff) > 0.001) return scoreDiff
      return a.distance_km - b.distance_km
    }
    // Consumidores: por distancia apenas
    if (mode === 'radius') return a.distance_km - b.distance_km
    // Em state/distributor, consumidores vao pro final (geradores sao prioritarios)
    return a.tipo === 'consumidor' ? 1 : -1
  })

  return sorted.slice(0, limit)
}

// ============================================
// RANKING DE GERADORES
// ============================================

export interface GeneratorRanking {
  id: string
  nome_usina: string
  capacidade_kwp: number
  excedente_mensal_kwh: number
  cidade: string
  estado: string
  latitude: number | null
  longitude: number | null
  preco_kwh: number | null
  desconto_percentual: number | null
  pacote_kwh: number | null
  pacote_preco: number | null
  ranking_score: number | null
  total_avaliacoes: number | null
  media_avaliacoes: number | null
  concessionaria: string | null
  distance_km?: number
}

export interface GetRankingInput {
  cidade?: string
  estado?: string
  userLat?: number
  userLng?: number
  radiusKm?: number
  limit?: number
  mode?: MatchMode
  distribuidora?: string
}

export interface GetRankingDeps {
  supabase: SupabaseClient<Database>
}

export async function getGeradoresRanking(
  input: GetRankingInput,
  deps: GetRankingDeps,
): Promise<GeneratorRanking[]> {
  const limit = input.limit ?? 20
  const radius = input.radiusKm ?? 100
  const mode: MatchMode = input.mode ?? 'radius'

  let q = deps.supabase
    .from('geradores')
    .select('id, nome_usina, capacidade_kwp, excedente_mensal_kwh, cidade, estado, latitude, longitude, preco_kwh, desconto_percentual, pacote_kwh, pacote_preco, ranking_score, total_avaliacoes, media_avaliacoes, concessionaria, status')
    .eq('status', 'ativo')
    .order('ranking_score', { ascending: false })
    .limit(limit)

  if (input.cidade) q = q.ilike('cidade', input.cidade)
  if (input.estado) q = q.ilike('estado', input.estado)
  if (input.distribuidora) q = q.ilike('concessionaria', input.distribuidora)

  const { data, error } = await q
  if (error || !data) return []

  let ranked: GeneratorRanking[] = data as GeneratorRanking[]

  // Para mode='radius', filtra por distancia
  // Para mode='state' ou 'distributor', mantem todos (ja filtrados por estado/distribuidora)
  if (mode === 'radius' && input.userLat !== undefined && input.userLng !== undefined) {
    ranked = ranked
      .filter((g) => g.latitude != null && g.longitude != null)
      .map((g) => ({
        ...g,
        distance_km: calculateDistance(
          { lat: input.userLat!, lng: input.userLng! },
          { lat: g.latitude!, lng: g.longitude! },
        ),
      }))
      .filter((g) => (g.distance_km ?? 0) <= radius)
      .sort((a, b) => (b.ranking_score ?? 0) - (a.ranking_score ?? 0))
  }

  return ranked
}

export interface CreateProposalInput {
  fromUserId: string
  toUserId: string
  message?: string
  geradorId?: string | null
  consumidorId?: string | null
  expiresAt?: Date | string
}

export interface CreateProposalDeps {
  supabase: SupabaseClient<Database>
  insert?: (row: Database['public']['Tables']['match_proposals']['Insert']) => Promise<{ data: any; error: any }>
}

export async function createMatchProposal(
  input: CreateProposalInput,
  deps: CreateProposalDeps,
): Promise<{ success: boolean; id?: number; message?: string }> {
  if (input.fromUserId === input.toUserId) {
    return { success: false, message: 'Não é possível propor match para si mesmo' }
  }

  const expires =
    input.expiresAt instanceof Date
      ? input.expiresAt.toISOString()
      : input.expiresAt ?? defaultProposalExpiry()

  const row: Database['public']['Tables']['match_proposals']['Insert'] = {
    from_user_id: input.fromUserId,
    to_user_id: input.toUserId,
    gerador_id: input.geradorId ?? null,
    consumidor_id: input.consumidorId ?? null,
    status: 'pending',
    message: input.message?.trim() ? input.message.trim().slice(0, 500) : null,
    expires_at: expires,
  }

  try {
    if (deps.insert) {
      const { data, error } = await deps.insert(row)
      if (error) return { success: false, message: error.message ?? 'Erro ao criar proposta' }
      const id = Array.isArray(data) ? data[0]?.id : (data as any)?.id
      return { success: true, id: typeof id === 'number' ? id : undefined }
    }
    const result = await (deps.supabase
      .from('match_proposals')
      .insert(row as any)
      .select('id')
      .single() as any)
    if (result?.error) {
      return { success: false, message: result.error.message ?? 'Erro ao criar proposta' }
    }
    const id = (result?.data as any)?.id
    return { success: true, id: typeof id === 'number' ? id : undefined }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

export interface RespondProposalInput {
  proposalId: number
  userId: string
  response: 'accepted' | 'rejected'
}

export interface RespondProposalDeps {
  supabase: SupabaseClient<Database>
  fetch?: (id: number) => Promise<{ data: any; error: any }>
  update?: (id: number, patch: Database['public']['Tables']['match_proposals']['Update']) => Promise<{ error: any }>
}

export async function respondToProposal(
  input: RespondProposalInput,
  deps: RespondProposalDeps,
): Promise<{ success: boolean; message?: string }> {
  const fetcher = deps.fetch
    ? deps.fetch
    : async (id: number) => {
        const result = await (deps.supabase
          .from('match_proposals')
          .select('*')
          .eq('id', id)
          .single() as any)
        return { data: result?.data, error: result?.error }
      }

  const { data: proposal, error: fetchError } = await fetcher(input.proposalId)
  if (fetchError || !proposal) {
    return { success: false, message: fetchError?.message ?? 'Proposta não encontrada' }
  }
  if (proposal.to_user_id !== input.userId) {
    return { success: false, message: 'Apenas o destinatário pode responder' }
  }
  if (proposal.status !== 'pending') {
    return { success: false, message: `Proposta já está ${proposal.status}` }
  }
  if (new Date(proposal.expires_at) < new Date()) {
    return { success: false, message: 'Proposta expirada' }
  }

  const patch: Database['public']['Tables']['match_proposals']['Update'] = {
    status: input.response,
    responded_at: new Date().toISOString(),
  }

  try {
    if (deps.update) {
      const { error } = await deps.update(input.proposalId, patch)
      if (error) return { success: false, message: error.message ?? 'Erro ao responder' }
      if (input.response === 'accepted') {
        await fireMatchCommissions(deps.supabase, input.proposalId)
      }
      return { success: true }
    }
    const sb: any = deps.supabase
    const result: { error: any } = await sb
      .from('match_proposals')
      .update(patch as any)
      .eq('id', input.proposalId)
    if (result?.error) {
      return { success: false, message: result?.error.message ?? 'Erro ao responder' }
    }
    if (input.response === 'accepted') {
      await fireMatchCommissions(deps.supabase, input.proposalId)
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

async function fireMatchCommissions(
  supabase: SupabaseClient<Database>,
  proposalId: number,
): Promise<void> {
  try {
    const { error } = await (supabase.rpc('process_match_commissions', {
      p_proposal_id: proposalId,
    } as any) as any)
    if (error) {
      console.error(`[commissions] process_match_commissions falhou (#${proposalId}):`, error)
    }
  } catch (err) {
    console.error(`[commissions] exception no match #${proposalId}:`, err)
  }
}

export interface GetProposalsInput {
  userId: string
  direction: 'sent' | 'received'
  status?: MatchProposalStatus
}

export async function getActiveProposals(
  input: GetProposalsInput,
  deps: Pick<FindCandidatesDeps, 'supabase'>,
): Promise<MatchProposalRecord[]> {
  try {
    const col = input.direction === 'sent' ? 'from_user_id' : 'to_user_id'
    let q = deps.supabase
      .from('match_proposals')
      .select('*')
      .eq(col, input.userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (input.status) {
      q = q.eq('status', input.status)
    }
    const result = await (q as any)
    return (result?.data ?? []) as MatchProposalRecord[]
  } catch {
    return []
  }
}

export function defaultProposalExpiry(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString()
}
