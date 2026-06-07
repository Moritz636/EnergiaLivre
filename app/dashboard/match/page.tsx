'use client'

// ============================================================
// /dashboard/match — Match geolocalizado premium
// (Member Plus only). Orquestra filtros, mapa, lista de
// cards e integração com LocationCapture.
// ============================================================

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/singleton'
import { useAuth } from '@/app/hooks/useAuth'
import { getMemberPlusStatus } from '@/lib/member-plus'
import MemberPlusBlocker from '@/components/Match/MemberPlusBlocker'
import type { MapMarker } from '@/components/Map/MatchMap'
import type { MatchMode } from '@/lib/matches'
import type { MatchCandidateData } from '@/components/Match/SwipeCard'

import { LoadingState } from './_components/LoadingState'
import { Header } from './_components/Header'
import { FiltersPanel } from './_components/FiltersPanel'
import { LocationCard } from './_components/LocationCard'
import { RefreshButton } from './_components/RefreshButton'
import { MapView } from './_components/MapView'
import { CandidatesList } from './_components/CandidatesList'
import { ToastBanner } from './_components/ToastBanner'
import { escapeHtml, formatDistance, plural } from './_utils/format'

type View = 'cards' | 'map'
type TargetTipo = 'gerador' | 'consumidor'

const SUCCESS_AUTO_DISMISS_MS = 4000

export default function DashboardMatchPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = getSupabase()

  const [view, setView] = useState<View>('cards')
  const [targetTipo, setTargetTipo] = useState<TargetTipo>('gerador')
  const [radiusKm, setRadiusKm] = useState(100)
  const [matchMode, setMatchMode] = useState<MatchMode>('radius')
  const [distribuidoraFilter, setDistribuidoraFilter] = useState<string>('')
  const [myEstado, setMyEstado] = useState<string>('')

  const [memberPlusActive, setMemberPlusActive] = useState<boolean | null>(null)
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [candidates, setCandidates] = useState<MatchCandidateData[]>([])
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [proposingId, setProposingId] = useState<string | null>(null)

  // Auth + Member Plus
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login?redirect=/dashboard/match')
      return
    }
    const checkMemberPlus = async () => {
      const status = await getMemberPlusStatus(supabase, user.id)
      setMemberPlusActive(status.active)
      setDaysRemaining(status.daysRemaining ?? 0)
    }
    checkMemberPlus()
  }, [user, authLoading, supabase, router])

  const loadMyLocation = useCallback(async () => {
    if (!user) return
    const { data } = await (supabase as any)
      .from('user_locations')
      .select('latitude, longitude, estado')
      .eq('user_id', user.id)
      .maybeSingle()
    if (data) {
      setMyLocation({ lat: data.latitude, lng: data.longitude })
      if (data.estado) setMyEstado(data.estado)
    }
  }, [user, supabase])

  const loadCandidates = useCallback(async () => {
    setLoadingCandidates(true)
    setError('')
    try {
      const params = new URLSearchParams({
        targetTipo,
        radiusKm: String(radiusKm),
        limit: '20',
        mode: matchMode,
      })
      if (matchMode === 'state' && myEstado) params.set('estado', myEstado)
      if (matchMode === 'distributor' && distribuidoraFilter) {
        params.set('distribuidora', distribuidoraFilter)
      }
      const res = await fetch(`/api/matches?${params}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 412) {
          setError('Você ainda não tem localização salva. Capture ou busque abaixo.')
          setCandidates([])
          return
        }
        throw new Error(body.error || 'Erro ao buscar candidatos')
      }
      const body = await res.json()
      const list = (body.candidates || []).map((c: any) => ({
        id: c.user_id || c.userId,
        nome: c.nome || c.cidade || 'Usuário',
        cidade: c.cidade,
        estado: c.estado,
        distanciaKm: c.distance_km ?? c.distanciaKm ?? null,
        lat: c.lat,
        lng: c.lng,
        tipo: c.tipo,
        isMemberPlus: !!c.is_member_plus,
        precoKwh: c.preco_kwh ?? null,
        descontoPercentual: c.desconto_percentual ?? null,
        pacoteKwh: c.pacote_kwh ?? null,
        pacotePreco: c.pacote_preco ?? null,
        rankingScore: c.ranking_score ?? null,
        totalAvaliacoes: c.total_avaliacoes ?? null,
        mediaAvaliacoes: c.media_avaliacoes ?? null,
        concessionaria: c.concessionaria ?? null,
      }))
      setCandidates(list)
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar candidatos')
    } finally {
      setLoadingCandidates(false)
    }
  }, [targetTipo, radiusKm, matchMode, myEstado, distribuidoraFilter])

  useEffect(() => {
    if (!user || !memberPlusActive) return
    loadMyLocation()
  }, [user, memberPlusActive, loadMyLocation])

  useEffect(() => {
    if (!user || !memberPlusActive) return
    loadCandidates()
  }, [user, memberPlusActive, loadCandidates])

  const handlePropose = useCallback(
    async (candidate: MatchCandidateData) => {
      if (!user) return
      setProposingId(candidate.id)
      setError('')
      setSuccess('')
      try {
        const res = await fetch('/api/matches/propose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: candidate.id,
            message: 'Tenho interesse em conectar!',
          }),
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Erro ao enviar proposta')
        setSuccess(`Proposta enviada para ${candidate.nome}!`)
        setCandidates((prev) => prev.filter((c) => c.id !== candidate.id))
      } catch (err: any) {
        setError(err?.message || 'Erro ao enviar proposta')
      } finally {
        setProposingId(null)
      }
    },
    [user],
  )

  const handleSkip = useCallback((candidate: MatchCandidateData) => {
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id))
  }, [])

  // ============================================================
  // Map derived state
  // ============================================================

  const mapCenter = useMemo<[number, number]>(() => {
    if (myLocation) return [myLocation.lat, myLocation.lng]
    const first = candidates.find(
      (c) => typeof c.lat === 'number' && typeof c.lng === 'number',
    )
    if (first && first.lat != null && first.lng != null) return [first.lat, first.lng]
    return [-23.5505, -46.6333]
  }, [myLocation, candidates])

  const mapMarkers = useMemo<MapMarker[]>(() => {
    const markers: MapMarker[] = []
    if (myLocation) {
      markers.push({
        id: 'me',
        lat: myLocation.lat,
        lng: myLocation.lng,
        label: 'Você',
        color: 'blue',
        popupHtml: '<strong>📍 Você está aqui</strong>',
      })
    }
    for (const c of candidates) {
      if (typeof c.lat !== 'number' || typeof c.lng !== 'number') continue
      const dist = c.distanciaKm != null ? formatDistance(c.distanciaKm) : ''
      const mp = c.isMemberPlus
        ? '<span style="display:inline-block;background:#eab308;color:#020617;padding:1px 6px;border-radius:6px;font-size:10px;font-weight:800;margin-left:4px;">PLUS</span>'
        : ''
      const popup = `<div style="font-family:sans-serif;color:#020617;"><strong>${escapeHtml(c.nome)}</strong>${mp}<br/><span style="color:#475569;font-size:11px;">${escapeHtml(c.cidade || '')}${c.estado ? ' / ' + escapeHtml(c.estado) : ''}</span>${dist ? `<br/><span style="color:#10b981;font-weight:700;">${dist}</span>` : ''}</div>`
      markers.push({
        id: c.id,
        lat: c.lat,
        lng: c.lng,
        label: c.nome,
        color: c.isMemberPlus ? 'yellow' : 'emerald',
        popupHtml: popup,
      })
    }
    return markers
  }, [candidates, myLocation])

  const mapZoom = useMemo(() => {
    if (radiusKm > 300) return 6
    if (radiusKm > 150) return 7
    if (radiusKm > 75) return 8
    if (radiusKm > 35) return 9
    return 10
  }, [radiusKm])

  // ============================================================
  // Render
  // ============================================================

  if (authLoading || memberPlusActive === null) return <LoadingState />
  if (!user) return null

  if (!memberPlusActive) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <MemberPlusBlocker daysRemaining={daysRemaining} />
        </div>
      </div>
    )
  }

  const hasCandidatesWithCoords = candidates.some((c) => c.lat != null)

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
      <div className="max-w-6xl mx-auto pt-6">
        <Header
          daysRemaining={daysRemaining}
          view={view}
          onViewChange={setView}
        />

        <div className="grid lg:grid-cols-[280px,1fr] gap-6">
          <aside className="space-y-4">
            <FiltersPanel
              matchMode={matchMode}
              onMatchModeChange={setMatchMode}
              targetTipo={targetTipo}
              onTargetTipoChange={setTargetTipo}
              radiusKm={radiusKm}
              onRadiusKmChange={setRadiusKm}
              myEstado={myEstado}
              distribuidoraFilter={distribuidoraFilter}
              onDistribuidoraFilterChange={setDistribuidoraFilter}
            />

            <LocationCard
              supabase={supabase}
              userId={user.id}
              myLocation={myLocation}
              onSaved={(lat, lng) => {
                setMyLocation({ lat, lng })
                loadCandidates()
              }}
              onClear={() => setMyLocation(null)}
            />

            <RefreshButton onClick={loadCandidates} loading={loadingCandidates} />
          </aside>

          <main>
            {error && (
              <ToastBanner message={error} variant="error" onDismiss={() => setError('')} />
            )}
            {success && (
              <ToastBanner
                message={success}
                variant="success"
                autoDismissMs={SUCCESS_AUTO_DISMISS_MS}
                onDismiss={() => setSuccess('')}
              />
            )}

            {view === 'map' ? (
              <MapView
                myLocation={myLocation}
                hasCandidatesWithCoords={hasCandidatesWithCoords}
                candidatesCount={candidates.length}
                mapCenter={mapCenter}
                mapZoom={mapZoom}
                mapMarkers={mapMarkers}
              />
            ) : (
              <CandidatesList
                candidates={candidates}
                loading={loadingCandidates}
                proposingId={proposingId}
                onPropose={handlePropose}
                onSkip={handleSkip}
              />
            )}

            {candidates.length > 0 && (
              <p className="text-center text-xs text-slate-500 mt-4">
                {candidates.length} {plural(candidates.length, 'candidato')} pronto
                {candidates.length === 1 ? '' : 's'} para proposta
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
