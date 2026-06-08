'use client'

// ============================================================
// /match — Pagina publica com 2 modos:
// 1. preview=true (sem member_plus): mostra 1-3 usinas
//    com blur, mapa com blur, e CTA R$ 9,99.
// 2. Acesso liberado (member_plus ativo): mapa completo,
//    lista de usinas sem blur, comparador.
// Apos Stripe checkout (session_id), ativa member_plus via
// webhook do Stripe (reusa webhook existente).
// ============================================================

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sparkles, ArrowLeft, MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'
import { getSupabase } from '@/lib/supabase/singleton'
import { AccessGateCard } from '@/components/AccessGateCard'
import { MatchResultsList, type MatchItem } from './_components/MatchResultsList'
import { MatchMapView } from './_components/MatchMapView'

interface PreviewPayload {
  cidade: string
  estado: string
  distribuidora: string
  subgrupo_tarifario: string
  consumo_kwh_medio: number
  valor_kwh_atual: number
  cep: string
  endereco: string
  lat: number
  lng: number
}

interface PreviewResponse {
  ok: boolean
  total_matches: number
  matches: MatchItem[]
  consumer: { lat: number; lng: number; cidade?: string; estado?: string; consumo_kwh_medio: number }
  paywall: { required: boolean; price_brl: number; plan: string; description: string }
}

interface MemberPlusState {
  active: boolean
  loading: boolean
  daysRemaining: number | null
}

export default function MatchPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <MatchPage />
    </Suspense>
  )
}

function MatchPage() {
  const params = useSearchParams()
  const isPreview = params.get('preview') === '1'
  const sessionId = params.get('session_id')
  const canceled = params.get('canceled') === '1'
  const unlocked = params.get('unlocked') === '1'

  const { user, loading: authLoading } = useAuth()
  const [payload, setPayload] = useState<PreviewPayload | null>(null)
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [access, setAccess] = useState<MemberPlusState>({ active: false, loading: true, daysRemaining: null })
  const [selectedUsinaId, setSelectedUsinaId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // 1) Carrega payload do sessionStorage (vindo de /location)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('match_preview_payload')
      if (raw) {
        const parsed = JSON.parse(raw) as PreviewPayload
        setPayload(parsed)
      }
    } catch {}
  }, [])

  // 2) Verifica member_plus do user
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setAccess({ active: false, loading: false, daysRemaining: null })
      return
    }
    const supabase = getSupabase()
    ;(async () => {
      try {
        const { data } = await (supabase
          .from('profiles')
          .select('member_plus_active, member_plus_expires_at')
          .eq('id', user.id)
          .single() as any)
        const expires = data?.member_plus_expires_at
        const active = !!data?.member_plus_active && (!expires || new Date(expires) > new Date())
        const days = expires
          ? Math.max(0, Math.ceil((new Date(expires).getTime() - Date.now()) / 86400000))
          : null
        setAccess({ active, loading: false, daysRemaining: days })
      } catch {
        setAccess({ active: false, loading: false, daysRemaining: null })
      }
    })()
  }, [user, authLoading, sessionId, unlocked])

  // 3) Mensagens de sucesso/cancelamento
  useEffect(() => {
    if (unlocked) {
      setSuccessMsg('Pagamento confirmado! Acesso liberado por 30 dias.')
      // Limpa params da URL sem redirecionar
      const url = new URL(window.location.href)
      url.searchParams.delete('unlocked')
      url.searchParams.delete('session_id')
      window.history.replaceState({}, '', url.toString())
      setTimeout(() => setSuccessMsg(null), 5000)
    }
    if (canceled) {
      setError('Pagamento cancelado. Tente novamente quando quiser.')
      setTimeout(() => setError(null), 5000)
    }
  }, [unlocked, canceled])

  // 4) Busca preview (se temos payload)
  useEffect(() => {
    if (!payload) return
    setLoadingPreview(true)
    ;(async () => {
      try {
        const res = await fetch('/api/match/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(j.error ?? 'Falha no preview')
        }
        const json = (await res.json()) as PreviewResponse
        setPreview(json)
        if (json.matches[0]) setSelectedUsinaId(json.matches[0].usina.id)
      } catch (err: any) {
        setError(err?.message ?? 'Erro ao calcular match')
      } finally {
        setLoadingPreview(false)
      }
    })()
  }, [payload])

  // Sem payload (acesso direto a /match): pede para comecar pelo /location
  if (!payload && !isPreview) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <MapPin className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h1 className="text-2xl font-black text-white mb-2">Comece pelo seu endereco</h1>
          <p className="text-sm text-slate-400 mb-6">
            Para encontrar a usina ideal, primeiro precisamos dos dados da sua fatura.
          </p>
          <a
            href="/location"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition"
          >
            <MapPin className="w-4 h-4" /> Informar dados da fatura
          </a>
        </div>
      </div>
    )
  }

  const hasAccess = access.active
  const showBlurred = isPreview && !hasAccess
  const matches = preview?.matches ?? []
  const consumer = payload
    ? { lat: payload.lat, lng: payload.lng, cidade: payload.cidade, estado: payload.estado }
    : preview?.consumer
      ? { lat: preview.consumer.lat, lng: preview.consumer.lng, cidade: preview.consumer.cidade, estado: preview.consumer.estado }
      : null

  const handleCheckout = async (params: { email: string; usinaId?: string }) => {
    const res = await fetch('/api/match/checkout-public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: params.email, usinaId: params.usinaId ?? selectedUsinaId }),
    })
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(j.error ?? 'Falha no checkout')
    }
    const json = await res.json()
    return {
      clientSecret: json.clientSecret,
      paymentIntentId: json.paymentIntentId,
      pix: json.pix,
    }
  }

  const handlePaymentComplete = () => {
    setAccess({ active: true, loading: false, daysRemaining: 30 })
    setSuccessMsg('Pagamento confirmado! Acesso liberado por 30 dias.')
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      <div
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20"
        aria-hidden
      />
      <div
        className="fixed bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] -z-10"
        aria-hidden
      />

      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-base font-black text-white tracking-tight">
            ENERGIA<span className="text-emerald-400">LIVRE</span>
          </a>
          <div className="flex items-center gap-3">
            {hasAccess && access.daysRemaining != null && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {access.daysRemaining}d restantes
              </span>
            )}
            {user ? (
              <a href="/dashboard-consumidor" className="text-sm text-slate-300 hover:text-white transition">
                Meu dashboard
              </a>
            ) : (
              <a
                href="/login?from=match"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Entrar
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <a
            href="/location"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Nova busca
          </a>
          {hasAccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> Acesso liberado
            </span>
          )}
        </div>

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {hasAccess ? 'Seu' : 'Possiveis'}{' '}
            <span className="text-emerald-400">matches</span>
          </h1>
          {payload && (
            <p className="text-sm text-slate-400 mt-1">
              {payload.cidade}/{payload.estado} · {payload.consumo_kwh_medio} kWh/mes ·{' '}
              {payload.distribuidora}
            </p>
          )}
        </header>

        {loadingPreview || access.loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl overflow-hidden">
                <MatchMapView
                  consumer={consumer}
                  matches={matches}
                  blurred={showBlurred}
                  selectedUsinaId={selectedUsinaId ?? undefined}
                  onSelectUsina={setSelectedUsinaId}
                />
              </div>
              <MatchResultsList
                matches={matches}
                blurred={showBlurred}
                selectedUsinaId={selectedUsinaId ?? undefined}
                onSelect={setSelectedUsinaId}
              />
            </div>

            <aside className="space-y-4">
              {showBlurred ? (
                <AccessGateCard
                  onCheckout={handleCheckout}
                  selectedUsinaId={selectedUsinaId ?? undefined}
                  onPaymentComplete={handlePaymentComplete}
                />
              ) : hasAccess ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Acesso completo</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Explore todas as usinas, compare precos e entre em contato direto.
                    Seu acesso expira em {access.daysRemaining} dia{access.daysRemaining === 1 ? '' : 's'}.
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 mt-2">Verificando acesso...</p>
                </div>
              )}

              {hasAccess && matches.length > 0 && selectedUsinaId && (
                <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                  <p className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold mb-1.5">
                    Proxima etapa
                  </p>
                  <p className="text-sm text-white">
                    Entre em contato com a usina selecionada para fechar a proposta.
                  </p>
                  <a
                    href={`https://wa.me/5584987858668?text=Olá! Vi o match de ${matches[0]?.usina.nome ?? ''} no Energia Livre e gostaria de conversar.`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-3 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition flex items-center justify-center gap-1.5"
                  >
                    Falar pelo WhatsApp
                  </a>
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
