import { createClient } from '@/lib/supabase/server'
import { getSupabase } from '@/lib/supabase/singleton'

export async function fetchUserBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('credit_transactions')
    .select('amount')
    .eq('user_id', userId)
  const rows = (data ?? []) as Array<{ amount: number }>
  return rows.reduce((sum, r) => sum + r.amount, 0)
}

export async function fetchUserHistory(userId: string, limit = 50) {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function requireAdmin(): Promise<{ user: any; isAdmin: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, isAdmin: false }
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return { user, isAdmin: profile?.role === 'admin' }
}
