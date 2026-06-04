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
}

export interface FindCandidatesDeps {
  supabase: SupabaseClient<Database>
  fetchLocations?: (
    userId: string,
    targetTipo: TargetTipo,
  ) => Promise<Array<{ user_id: string; lat: number; lng: number; cidade: string; estado: string; nome: string; tipo: TargetTipo; member_plus_active: boolean }>>
}

export async function findCandidates(
  input: FindCandidatesInput,
  deps: FindCandidatesDeps,
): Promise<MatchCandidate[]> {
  const radius = input.radiusKm ?? 50
  const limit = input.limit ?? 50

  const fetcher = deps.fetchLocations
    ? deps.fetchLocations
    : async (userId: string, targetTipo: TargetTipo) => {
        const result = await (deps.supabase
          .from('user_locations')
          .select('user_id, lat, lng, cidade, estado, profiles!inner(nome, tipo, is_active, member_plus_active)')
          .eq('profiles.tipo', targetTipo)
          .neq('user_id', userId) as any)
        const rows = (result?.data ?? []) as Array<any>
        return rows.map((r) => ({
          user_id: r.user_id,
          lat: r.lat,
          lng: r.lng,
          cidade: r.cidade,
          estado: r.estado,
          nome: (r.profiles?.nome as string) ?? 'Usuário',
          tipo: ((r.profiles?.tipo as TargetTipo) ?? targetTipo),
          member_plus_active: !!(r.profiles?.member_plus_active),
        }))
      }

  const rows = await fetcher(input.userId, input.targetTipo)

  const candidates: MatchCandidate[] = rows
    .filter((r) => r.tipo === input.targetTipo && r.user_id !== input.userId)
    .map((r) => ({
      user_id: r.user_id,
      nome: r.nome,
      cidade: r.cidade,
      estado: r.estado,
      lat: r.lat,
      lng: r.lng,
      distance_km: calculateDistance(input.origin, { lat: r.lat, lng: r.lng }),
      tipo: r.tipo,
      is_member_plus: r.member_plus_active,
    }))
    .filter((c) => c.distance_km <= radius)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit)

  return candidates
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
      return { success: true }
    }
    const sb: any = deps.supabase
    const result: { error: any } = await sb
      .from('match_proposals')
      .update(patch as any)
      .eq('id', input.proposalId)
    if (result?.error) {
      return { success: false, message: result.error.message ?? 'Erro ao responder' }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
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
