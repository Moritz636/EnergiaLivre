import type { SupabaseClient } from '@supabase/supabase-js'

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'payment' | 'commission' | 'lead'

export async function createNotification(
  supabase: SupabaseClient,
  params: {
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
    metadata?: Record<string, unknown>
  },
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('criar_notificacao', {
      p_user_id: params.userId,
      p_type: params.type,
      p_title: params.title,
      p_message: params.message,
      p_link: params.link ?? null,
      p_metadata: params.metadata ?? null,
    } as any)
    if (error) console.error('[notifications] RPC error:', error)
    return !error
  } catch (err) {
    console.error('[notifications] create error:', err)
    return false
  }
}
