'use client'

// ============================================================
// /dashboard-consumidor — Painel principal do consumidor.
// Orquestra métricas, faturas, plano e CTAs premium.
// ============================================================

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { getSupabase } from '@/lib/supabase/singleton'
import { ConsentModal } from '@/components/ConsentModal'
import { CURRENT_TERMS_VERSION } from '@/lib/commissions'
import type { Database } from '@/lib/database.types'

import { Nav } from './_components/Nav'
import { Hero, type HeroData } from './_components/Hero'
import { QuickActions } from './_components/QuickActions'
import { MatchCallout } from './_components/MatchCallout'
import {
  MetricsGrid,
  EMPTY_METRICS,
  type Metrics,
} from './_components/MetricsGrid'
import { InvoicesList, type InvoiceItem } from './_components/InvoicesList'
import { PlanCard, type PlanData } from './_components/PlanCard'
import { MotivationBlock } from './_components/MotivationBlock'
import { MemberPlusCta } from './_components/MemberPlusCta'
import { LoadingState } from './_components/LoadingState'
import FaturasSummary from './_components/FaturasSummary'
import OnboardingWizard from '@/components/OnboardingWizard'
import InvoiceReminder from '@/components/InvoiceReminder'

type Assinatura = Database['public']['Tables']['assinaturas']['Row']

interface FullState {
  metrics: Metrics
  diasConectado: number
  plan: PlanData
}

const INITIAL_STATE: FullState = {
  metrics: EMPTY_METRICS,
  diasConectado: 0,
  plan: { planoAtivo: false, nomePlano: 'Sem plano', proximaFatura: null },
}

export default function DashboardConsumidorPage() {
  const { user, profile, loading, logout } = useAuth()
  const [state, setState] = useState<FullState>(INITIAL_STATE)
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [showConsent, setShowConsent] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [invoices, setInvoices] = useState<InvoiceItem[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const supabase = getSupabase()

  // Termos de pagamento
  useEffect(() => {
    if (!user) return
    if (consentChecked) return
    if (profile) {
      const accepted = !!(profile as any).agreed_to_payment_terms_at
      const version = (profile as any).last_terms_version
      if (!accepted || version !== CURRENT_TERMS_VERSION) {
        setShowConsent(true)
      }
      setConsentChecked(true)
    }
  }, [user, profile, consentChecked])

  // Carrega métricas do consumidor + assinatura
  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function loadMetrics() {
      try {
        const [consumidorRes, assinaturaRes] = await Promise.all([
          (supabase as any).from('consumidores').select('*').eq('id', user!.id).single(),
          (supabase as any)
            .from('assinaturas')
            .select('*')
            .eq('user_id', user!.id)
            .eq('status', 'active')
            .maybeSingle(),
        ])

        if (cancelled) return

        const assinaturaRow = (assinaturaRes.data as Assinatura | null) ?? null
        const kwh = assinaturaRow?.kwh_mensais || 0
        const economiaPercent = assinaturaRow?.economia_percentual || 25
        const faturaAtual = kwh * 0.95
        const economia = faturaAtual * (economiaPercent / 100)
        const diasConectado = consumidorRes.data?.created_at
          ? Math.floor(
              (Date.now() - new Date(consumidorRes.data.created_at).getTime()) / 86400000,
            )
          : 0

        setState({
          metrics: {
            economiaMensal: Math.round(economia),
            kwhEconomizados: kwh,
            co2Evitado: Math.round(kwh * 0.0817),
            arvoresSalvas: Math.round((kwh * 0.0817) / 22),
            percentualEconomia: economiaPercent,
          },
          diasConectado,
          plan: {
            planoAtivo: !!assinaturaRow,
            nomePlano: assinaturaRow?.nome_plano || 'Sem plano',
            proximaFatura: assinaturaRow?.current_period_end || null,
          },
        })
      } catch (err) {
        console.error('Erro ao carregar métricas:', err)
      } finally {
        if (!cancelled) setLoadingMetrics(false)
      }
    }

    loadMetrics()
    return () => {
      cancelled = true
    }
  }, [user, supabase])

  // Carrega faturas separadamente
  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function loadInvoices() {
      try {
        const { data } = await supabase
          .from('invoice_uploads')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(5)
        if (!cancelled) setInvoices(((data as any[]) ?? []) as InvoiceItem[])
      } catch (err) {
        console.error('Erro ao carregar faturas:', err)
      } finally {
        if (!cancelled) setLoadingInvoices(false)
      }
    }

    loadInvoices()
    return () => {
      cancelled = true
    }
  }, [user, supabase])

  if (loading || loadingMetrics) return <LoadingState />
  if (!user) return null

  const heroData: HeroData = {
    planoAtivo: state.plan.planoAtivo,
    nomePlano: state.plan.nomePlano,
    percentualEconomia: state.metrics.percentualEconomia,
  }

  const matchableCount = invoices.filter((i) => i.match_eligible).length
  const co2Total = state.metrics.co2Evitado * state.diasConectado

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      <ConsentModal
        open={showConsent}
        onAccepted={() => {
          setShowConsent(false)
          window.location.reload()
        }}
      />

      {user && (
        <OnboardingWizard
          userId={user.id}
          profile={{
            nome: profile?.nome,
            cidade: profile?.cidade,
            tipo: profile?.tipo,
          }}
          onComplete={() => {}}
        />
      )}

      <div
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20"
        aria-hidden
      />
      <div
        className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10"
        aria-hidden
      />
      <div
        className="fixed top-40 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[100px] -z-10"
        aria-hidden
      />

      <Nav userName={profile?.nome} onLogout={logout} />

      {user && (
        <div className="pt-20 px-6 max-w-7xl mx-auto">
          <InvoiceReminder userId={user.id} />
        </div>
      )}

      <main className="pt-6 pb-12 px-6 max-w-7xl mx-auto">
        <Hero data={heroData} />

        <QuickActions />

        <MatchCallout matchableCount={matchableCount} />

        <MetricsGrid metrics={state.metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            <InvoicesList invoices={invoices} loading={loadingInvoices} />
            <PlanCard plan={state.plan} />
          </div>
          <div className="space-y-6">
            <FaturasSummary userId={user.id} />
            <a
              href="/checkout"
              className="block p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 hover:border-emerald-500/40 transition text-center"
            >
              <p className="text-lg font-black text-white mb-1">Assine um Plano</p>
              <p className="text-xs text-emerald-400">Economize até 38% na conta de luz</p>
            </a>
          </div>
        </div>

        <MotivationBlock
          diasConectado={state.diasConectado}
          co2Total={co2Total}
        />

        {matchableCount === 0 && <MemberPlusCta />}
      </main>
    </div>
  )
}
