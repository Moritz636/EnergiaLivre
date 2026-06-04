'use server'
import { captureLead, validateLead } from '@/lib/leads'
import type { LeadInput, LeadResult } from '@/lib/leads'
import { createClient } from '@/lib/supabase/server'

export type SaveLeadInput =
  | (Omit<LeadInput, 'tipo'> & { tipo?: 'consumidor' | 'gerador' | 'parceiro' })
  | { tipo: 'consumidor' | 'gerador' | 'parceiro'; [k: string]: unknown }

export async function saveLead(input: SaveLeadInput): Promise<LeadResult> {
  const supabase = await createClient()
  return captureLead(input, { supabase })
}

export async function previewLead(input: SaveLeadInput) {
  return validateLead(input)
}
