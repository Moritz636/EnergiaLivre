// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = 'https://eahwyotzbskfjvsoqzw.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHd5b3R6YnNrZmp2cXNvcXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjg4MDIsImV4cCI6MjA5NDYwNDgwMn0.TpHyG89UqOqmlZDuWxox6SUcducSNMPiYCx35vtFqrY'
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}