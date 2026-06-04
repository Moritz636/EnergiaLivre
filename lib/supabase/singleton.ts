import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

let _supabase: ReturnType<typeof createClient> | null = null

function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient()
  }
  return _supabase
}

export function resetSupabase() {
  _supabase = null
}
