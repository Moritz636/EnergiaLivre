// ============================================
// MEMBER PLUS - ASSINATURAS ACESSO MATCH
// ============================================
// Usado por:
//   - app/api/stripe/webhook/route.ts (ativa/desativa)
//   - app/dashboard/match/page.tsx (gate de UI)
//   - app/checkout-member-plus/page.tsx (verifica status)
//   - components/Match/MemberPlusBlocker.tsx (CTA)
// ============================================

export interface MemberPlusStatus {
  active: boolean
  expiresAt: string | null
  activatedAt: string | null
  daysRemaining: number | null
}

type SupabaseLike = {
  from: (table: string) => any
}

export async function isMemberPlus(
  supabase: SupabaseLike,
  userId: string,
): Promise<boolean> {
  const status = await getMemberPlusStatus(supabase, userId)
  return status.active
}

export async function getMemberPlusStatus(
  supabase: SupabaseLike,
  userId: string,
): Promise<MemberPlusStatus> {
  try {
    const sb: any = supabase
    const result = await sb
      .from('profiles')
      .select('member_plus_active, member_plus_activated_at, member_plus_expires_at')
      .eq('id', userId)
      .single()
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
  supabase: SupabaseLike,
  userId: string,
  durationDays: number = 30,
): Promise<{ success: boolean; message?: string }> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + durationDays)
  const patch = {
    member_plus_active: true,
    member_plus_activated_at: new Date().toISOString(),
    member_plus_expires_at: expiresAt.toISOString(),
  }
  try {
    const sb: any = supabase
    const result = await sb.from('profiles').update(patch).eq('id', userId)
    if (result?.error) {
      return { success: false, message: result.error.message ?? 'Erro ao ativar' }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

export async function deactivateMemberPlus(
  supabase: SupabaseLike,
  userId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const sb: any = supabase
    const result = await sb
      .from('profiles')
      .update({ member_plus_active: false, member_plus_expires_at: null })
      .eq('id', userId)
    if (result?.error) {
      return { success: false, message: result.error.message ?? 'Erro ao desativar' }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}
