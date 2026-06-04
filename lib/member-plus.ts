// ============================================
// MEMBER PLUS - ASSINATURAS ACESSO MATCH
// ============================================
// Usado por:
//   - app/api/stripe/webhook/route.ts (ativa/desativa)
//   - app/dashboard/match/page.tsx (gate de UI)
//   - components/Match/MemberPlusBlocker.tsx (CTA)
// ============================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export interface MemberPlusStatus {
  active: boolean
  expiresAt: string | null
  activatedAt: string | null
  daysRemaining: number | null
}

export interface MemberPlusDeps {
  supabase: SupabaseClient<Database>
  userId: string
  select?: (cols: string) => Promise<{ data: any; error: any }>
  update?: (patch: Database['public']['Tables']['profiles']['Update']) => Promise<{ error: any }>
}

export async function isMemberPlus(
  deps: MemberPlusDeps,
): Promise<boolean> {
  const status = await getMemberPlusStatus(deps)
  return status.active
}

export async function getMemberPlusStatus(
  deps: MemberPlusDeps,
): Promise<MemberPlusStatus> {
  try {
    const result = deps.select
      ? await deps.select('member_plus_active, member_plus_activated_at, member_plus_expires_at')
      : await (deps.supabase
          .from('profiles')
          .select('member_plus_active, member_plus_activated_at, member_plus_expires_at')
          .eq('id', deps.userId)
          .single() as any)
    const data = result?.data as
      | {
          member_plus_active: boolean
          member_plus_activated_at: string | null
          member_plus_expires_at: string | null
        }
      | null
    if (!data) {
      return { active: false, expiresAt: null, activatedAt: null, daysRemaining: null }
    }

    const expiresAt = data.member_plus_expires_at
    const active = !!data.member_plus_active && (!expiresAt || new Date(expiresAt) > new Date())
    const daysRemaining = expiresAt
      ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000))
      : null

    return {
      active,
      expiresAt,
      activatedAt: data.member_plus_activated_at,
      daysRemaining,
    }
  } catch {
    return { active: false, expiresAt: null, activatedAt: null, daysRemaining: null }
  }
}

export async function activateMemberPlus(
  deps: MemberPlusDeps,
  expiresAt?: Date | string,
): Promise<{ success: boolean; message?: string }> {
  const expires = expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt ?? defaultExpiresAt()
  const patch = {
    member_plus_active: true,
    member_plus_activated_at: new Date().toISOString(),
    member_plus_expires_at: expires,
  }
  try {
    if (deps.update) {
      const { error } = await deps.update(patch as any)
      if (error) return { success: false, message: error.message ?? 'Erro ao ativar' }
      return { success: true }
    }
    const sb: any = deps.supabase
    const result: { error: any } = await sb
      .from('profiles')
      .update(patch)
      .eq('id', deps.userId)
    if (result?.error) {
      return { success: false, message: result.error.message ?? 'Erro ao ativar' }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

export async function deactivateMemberPlus(
  deps: MemberPlusDeps,
): Promise<{ success: boolean; message?: string }> {
  const patch = {
    member_plus_active: false,
    member_plus_expires_at: null as string | null,
  }
  try {
    if (deps.update) {
      const { error } = await deps.update(patch as any)
      if (error) return { success: false, message: error.message ?? 'Erro ao desativar' }
      return { success: true }
    }
    const sb: any = deps.supabase
    const result: { error: any } = await sb
      .from('profiles')
      .update(patch)
      .eq('id', deps.userId)
    if (result?.error) {
      return { success: false, message: result.error.message ?? 'Erro ao desativar' }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

export function defaultExpiresAt(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString()
}
