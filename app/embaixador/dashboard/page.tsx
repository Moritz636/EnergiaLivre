'use client'

// ============================================================
// /embaixador/dashboard — Painel principal do embaixador.
//
// Orquestra:
//   • Carregamento de métricas (leads, comissões, meta).
//   • Consent modal para aceite de termos.
//   • Subcomponentes em _components/* para cada bloco da UI.
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import { getSupabase } from '@/lib/supabase/singleton'
import { ConsentModal } from '@/components/ConsentModal'
import { CURRENT_TERMS_VERSION } from '@/lib/commissions'
import type { Database } from '@/lib/database.types'

import { Nav } from './_components/Nav'
import { Header } from './_components/Header'
import { MetricsGrid, type Metrics } from './_components/MetricsGrid'
import type { ComissaoItem } from './_components/CommissionsList'
import type { LeadItem } from './_components/LeadsList'
import { GoalProgress } from './_components/GoalProgress'
import { ReferralCard } from './_components/ReferralCard'
import { CommissionsList } from './_components/CommissionsList'
import { LeadsList } from './_components/LeadsList'
import { FooterMeta } from './_components/FooterMeta'
import { LoadingState } from './_components/LoadingState'
import { CreditWallet } from '@/components/CreditWallet'

type LeadRow = Database['public']['Tables']['leads']['Row']
type ComissaoRow = Database['public']['Tables']['comissoes']['Row']

const META_MENSAL = 20

const EMPTY_METRICS: Metrics = {
  totalEstimado: 0,
  totalPago: 0,
  indicadosMes: 0,
  leadsCount: 0,
  aprovadosCount: 0,
}

export default function DashboardEmbaixadorPage() {
  const router = useRouter()
  const { user, profile, loading, logout } = useAuth()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [recentLeads, setRecentLeads] = useState<LeadItem[]>([])
  const [recentComissoes, setRecentComissoes] = useState<ComissaoItem[]>([])
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [showConsent, setShowConsent] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const supabase = getSupabase()

  const referralLink = useMemo(() => {
    if (typeof window === 'undefined' || !user) return ''
    return `${window.location.origin}/?ref=${user.id}`
  }, [user])

  // Termos de pagamento: força re-aceite se versão mudou.
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

  // Carrega métricas + leads + comissões em paralelo.
  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      try {
        const [leadsCountRes, aprovadosCountRes, comissoesRes, leadsRes] = await Promise.all([
          supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user!.id)
            .eq('tipo', 'parceiro'),
          supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user!.id)
            .eq('tipo', 'parceiro')
            .eq('status', 'aprovado'),
          supabase
            .from('comissoes')
            .select('*')
            .eq('embaixador_id', user!.id),
          supabase
            .from('leads')
            .select('*')
            .eq('user_id', user!.id)
            .eq('tipo', 'parceiro')
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        if (cancelled) return

        const allComissoes = (comissoesRes.data as ComissaoRow[] | null) ?? []
        const totalPago = allComissoes
          .filter((c) => c.status_pagamento === 'pago')
          .reduce((sum, c) => sum + Number(c.valor_comissao ?? 0), 0)
        const totalPendente = allComissoes
          .filter((c) => c.status_pagamento === 'pendente')
          .reduce((sum, c) => sum + Number(c.valor_comissao ?? 0), 0)

        const inicioMes = new Date()
        inicioMes.setDate(1)
        inicioMes.setHours(0, 0, 0, 0)
        const indicadosMes = allComissoes.filter(
          (c) => new Date(c.created_at) >= inicioMes,
        ).length

        setRecentLeads(((leadsRes.data as LeadRow[] | null) ?? []) as LeadItem[])
        setRecentComissoes(
          allComissoes
            .slice()
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            )
            .slice(0, 5) as ComissaoItem[],
        )
        setMetrics({
          leadsCount: leadsCountRes.count ?? 0,
          aprovadosCount: aprovadosCountRes.count ?? 0,
          totalPago,
          totalEstimado: totalPago + totalPendente,
          indicadosMes,
        })
      } catch (err) {
        console.error('Erro ao carregar dashboard do embaixador:', err)
      } finally {
        if (!cancelled) setLoadingMetrics(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, supabase])

  if (loading || loadingMetrics) return <LoadingState />
  if (!user) {
    router.push('/login?from=parceiro')
    return null
  }

  const m: Metrics = metrics ?? EMPTY_METRICS
  const createdAt = (profile as any)?.created_at ?? null

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      <ConsentModal
        open={showConsent}
        onAccepted={() => {
          setShowConsent(false)
          window.location.reload()
        }}
      />

      {/* Background premium (radial gradient + blurs) */}
      <div
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent -z-20"
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

      <Nav profile={profile} onLogout={logout} />

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <Header cidade={profile?.cidade} estado={profile?.estado} />

        <MetricsGrid metrics={m} />

        <GoalProgress indicadosMes={m.indicadosMes} meta={META_MENSAL} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            <ReferralCard referralLink={referralLink} />
            <CommissionsList comissoes={recentComissoes} />
          </div>
          <div>
            <CreditWallet userId={user.id} />
          </div>
        </div>

        <LeadsList leads={recentLeads} />

        <FooterMeta createdAt={createdAt} leadsCount={m.leadsCount} />
      </main>
    </div>
  )
}
