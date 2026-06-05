// ============================================
// COMISSOES + ACORDO LEGAL
// ============================================
// Camada client-side para os RPCs:
//   - record_payment_agreement (lib/sql/payment_agreements)
//   - process_match_commissions (chamado no match accept)
//   - process_payment_commissions (chamado no Stripe webhook)
// Usado por:
//   - app/api/agreements/route.ts
//   - lib/matches.ts (no respondToProposal)
//   - app/api/stripe/webhook/route.ts
// ============================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export const CURRENT_TERMS_VERSION = 'v1.0'
export const CURRENT_TERMS_HASH = 'sha256-20260110-v1'

export interface RecordAgreementInput {
  userId: string
  termsVersion?: string
  termsHash?: string
  ipAddress?: string | null
  userAgent?: string | null
  documentUrl?: string | null
}

export interface RecordAgreementResult {
  alreadyAccepted: boolean
  agreementId: string
  acceptedAt: string
}

export async function recordPaymentAgreement(
  input: RecordAgreementInput,
  deps: { supabase: SupabaseClient<Database> },
): Promise<{ success: boolean; result?: RecordAgreementResult; message?: string }> {
  try {
    const { data, error } = await (deps.supabase.rpc('record_payment_agreement', {
      p_user_id: input.userId,
      p_terms_version: input.termsVersion ?? CURRENT_TERMS_VERSION,
      p_terms_hash: input.termsHash ?? CURRENT_TERMS_HASH,
      p_ip_address: input.ipAddress ?? null,
      p_user_agent: input.userAgent ?? null,
      p_document_url: input.documentUrl ?? null,
    } as any) as any)

    if (error) {
      return { success: false, message: error.message ?? 'Erro ao registrar acordo' }
    }

    const row = Array.isArray(data) ? data[0] : data
    if (!row) {
      return { success: false, message: 'Resposta vazia do servidor' }
    }

    return {
      success: true,
      result: {
        alreadyAccepted: !!row.already_accepted,
        agreementId: row.agreement_id,
        acceptedAt: row.accepted_at,
      },
    }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

export async function processMatchCommissions(
  proposalId: number,
  deps: { supabase: SupabaseClient<Database> },
): Promise<{ success: boolean; message?: string; coinsCredited?: number; inviterCredited?: number }> {
  try {
    const { data, error } = await (deps.supabase.rpc('process_match_commissions', {
      p_proposal_id: proposalId,
    } as any) as any)

    if (error) {
      return { success: false, message: error.message ?? 'Erro ao processar comissões' }
    }
    const row = Array.isArray(data) ? data[0] : data
    return {
      success: !!row?.success,
      message: row?.message,
      coinsCredited: row?.coins_credited,
      inviterCredited: row?.inviter_credited,
    }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

export async function processPaymentCommissions(
  paymentId: number,
  deps: { supabase: SupabaseClient<Database> },
): Promise<{
  success: boolean
  message?: string
  embaixadorCommission?: number
  ufvCommission?: number
}> {
  try {
    const { data, error } = await (deps.supabase.rpc('process_payment_commissions', {
      p_payment_id: paymentId,
    } as any) as any)

    if (error) {
      return { success: false, message: error.message ?? 'Erro ao processar comissões de pagamento' }
    }
    const row = Array.isArray(data) ? data[0] : data
    return {
      success: !!row?.success,
      message: row?.message,
      embaixadorCommission: row?.embaixador_commission,
      ufvCommission: row?.ufv_commission,
    }
  } catch (err: any) {
    return { success: false, message: err?.message ?? 'Erro inesperado' }
  }
}

export async function getUserAgreementStatus(
  userId: string,
  deps: { supabase: SupabaseClient<Database> },
): Promise<{ hasAccepted: boolean; version: string | null; acceptedAt: string | null }> {
  try {
    const { data, error } = await (deps.supabase
      .from('profiles')
      .select('agreed_to_payment_terms_at, last_terms_version')
      .eq('id', userId)
      .single() as any)

    if (error || !data) {
      return { hasAccepted: false, version: null, acceptedAt: null }
    }

    return {
      hasAccepted: !!data.agreed_to_payment_terms_at,
      version: data.last_terms_version ?? null,
      acceptedAt: data.agreed_to_payment_terms_at ?? null,
    }
  } catch {
    return { hasAccepted: false, version: null, acceptedAt: null }
  }
}
