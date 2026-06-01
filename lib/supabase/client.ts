import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://eahwyotzbskfjvsoqzw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHd5b3R6YnNrZmp2cXNvcXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjg4MDIsImV4cCI6MjA5NDYwNDgwMn0.TpHyG89UqOqmlZDuWxox6SUcducSNMPiYCx35vtFqrY'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}