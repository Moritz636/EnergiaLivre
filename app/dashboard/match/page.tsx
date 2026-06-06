'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getSupabase } from '@/lib/supabase/singleton';
import { useAuth } from '@/app/hooks/useAuth';
import { isMemberPlus, getMemberPlusStatus } from '@/lib/member-plus';
import LocationCapture from '@/components/LocationCapture';
import SwipeCard, { type MatchCandidateData } from '@/components/Match/SwipeCard';
import MemberPlusBlocker from '@/components/Match/MemberPlusBlocker';
import type { MapMarker } from '@/components/Map/MatchMap';
import { DISTRIBUIDORAS, getDistribuidorasPorEstado } from '@/lib/distribuidoras';
import type { MatchMode } from '@/lib/matches';
import {
  Loader2,
  Map as MapIcon,
  List,
  Sliders,
  RefreshCcw,
  Crown,
  Sparkles,
  Search,
  MapPin,
  Globe2,
  Zap,
  Check,
} from 'lucide-react';

const MatchMap = dynamic(() => import('@/components/Map/MatchMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  ),
})

const TARGET_TIPO_OPTIONS = [
  { value: 'gerador', label: 'Geradores' },
  { value: 'consumidor', label: 'Consumidores' },
] as const

const RADIUS_OPTIONS = [25, 50, 100, 250, 500]

const MATCH_MODES: Array<{ value: MatchMode; label: string; icon: typeof MapPin; desc: string }> = [
  { value: 'radius', label: 'Perto', icon: MapPin, desc: 'Por distância (km)' },
  { value: 'state', label: 'Estado', icon: Globe2, desc: 'Mesma UF' },
  { value: 'distributor', label: 'Distribuidora', icon: Zap, desc: 'Mesma rede' },
]

type View = 'cards' | 'map'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default function DashboardMatchPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = getSupabase()

  const [view, setView] = useState<View>('cards')
  const [targetTipo, setTargetTipo] = useState<'gerador' | 'consumidor'>('gerador')
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
  }, [user, authLoading])

  useEffect(() => {
    if (!user || !memberPlusActive) return
    loadMyLocation()
  }, [user, memberPlusActive])

  useEffect(() => {
    if (!user || !memberPlusActive) return
    loadCandidates()
  }, [user, memberPlusActive, targetTipo, radiusKm, matchMode, distribuidoraFilter, myEstado])

  const loadMyLocation = async () => {
    if (!user) return
    const sb: any = supabase
    const { data } = await sb
      .from('user_locations')
      .select('latitude, longitude, estado')
      .eq('user_id', user.id)
      .maybeSingle()
    if (data) {
      setMyLocation({ lat: data.latitude, lng: data.longitude })
      if (data.estado) setMyEstado(data.estado)
    }
  }

  const loadCandidates = async () => {
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
  }

  const handlePropose = useCallback(async (candidate: MatchCandidateData) => {
    if (!user) return
    setProposingId(candidate.id)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/matches/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: candidate.id, message: 'Tenho interesse em conectar!' }),
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
  }, [user])

  const handleSkip = useCallback((candidate: MatchCandidateData) => {
    setCandidates((prev) => prev.filter((c) => c.id !== candidate.id))
  }, [])

  const mapCenter = useMemo<[number, number]>(() => {
    if (myLocation) return [myLocation.lat, myLocation.lng]
    const first = candidates.find((c) => typeof c.lat === 'number' && typeof c.lng === 'number')
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
      const dist = c.distanciaKm != null ? `${c.distanciaKm.toFixed(0)} km` : ''
      const mp = c.isMemberPlus ? '<span style="display:inline-block;background:#eab308;color:#020617;padding:1px 6px;border-radius:6px;font-size:10px;font-weight:800;margin-left:4px;">PLUS</span>' : ''
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

  if (authLoading || memberPlusActive === null) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
      <div className="max-w-6xl mx-auto pt-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Crown className="w-7 h-7 text-yellow-400" />
              Match Geolocalizado
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {daysRemaining > 0 ? `Member Plus ativo • ${daysRemaining} dias restantes` : 'Member Plus ativo'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('cards')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-bold transition ${
                view === 'cards' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <List className="w-4 h-4" /> Cards
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm font-bold transition ${
                view === 'map' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <MapIcon className="w-4 h-4" /> Mapa
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px,1fr] gap-6">
          <aside className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Filtros
              </h3>

              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-1.5">Modo de busca</p>
                <div className="grid grid-cols-3 gap-1">
                  {MATCH_MODES.map((m) => {
                    const Icon = m.icon
                    return (
                      <button
                        key={m.value}
                        onClick={() => {
                          setMatchMode(m.value)
                          // Auto-preencher se temos UF do usuario (modo state)
                          if (m.value === 'state' && !myEstado && myLocation === null) {
                            // precisa de localizacao para saber a UF
                          }
                          // Auto-sugerir distribuidora se for modo distributor e temos UF
                          if (m.value === 'distributor' && myEstado && !distribuidoraFilter) {
                            const sugestoes = getDistribuidorasPorEstado(myEstado)
                            if (sugestoes[0]) setDistribuidoraFilter(sugestoes[0].nome)
                          }
                        }}
                        title={m.desc}
                        className={`px-2 py-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center gap-1 ${
                          matchMode === m.value
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {m.label}
                      </button>
                    )
                  })}
                </div>
                {matchMode === 'state' && !myEstado && (
                  <p className="text-[10px] text-amber-300 mt-1.5">Defina sua localização para usar este modo.</p>
                )}
                {matchMode === 'distributor' && !distribuidoraFilter && (
                  <p className="text-[10px] text-amber-300 mt-1.5">Escolha uma distribuidora abaixo.</p>
                )}
              </div>

              {matchMode === 'distributor' && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1.5">Distribuidora</p>
                  <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {DISTRIBUIDORAS.map((d) => (
                      <button
                        key={d.codigo}
                        onClick={() => setDistribuidoraFilter(d.nome)}
                        className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between gap-2 ${
                          distribuidoraFilter === d.nome
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <span className="flex flex-col items-start min-w-0">
                          <span className="truncate">{d.nome}</span>
                          <span className="text-[9px] text-slate-500 font-normal">
                            {d.estados.join(', ')} • {d.market_share}% share
                          </span>
                        </span>
                        {distribuidoraFilter === d.nome && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-1.5">Buscar</p>
                <div className="grid grid-cols-2 gap-1">
                  {TARGET_TIPO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTargetTipo(opt.value)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition ${
                        targetTipo === opt.value
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {matchMode === 'radius' && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Raio: <strong className="text-white">{radiusKm} km</strong></p>
                  <div className="flex flex-wrap gap-1">
                    {RADIUS_OPTIONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRadiusKm(r)}
                        className={`px-2 py-1 rounded text-xs font-bold transition ${
                          radiusKm === r
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {r}km
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchMode === 'state' && myEstado && (
                <p className="text-xs text-emerald-300 mt-1">
                  Buscando em <strong className="text-white">{myEstado}</strong> (todas as distâncias)
                </p>
              )}

              {matchMode === 'distributor' && distribuidoraFilter && (
                <p className="text-xs text-emerald-300 mt-1">
                  Mesma rede: <strong className="text-white">{distribuidoraFilter}</strong>
                </p>
              )}
            </div>

            {!myLocation ? (
              <LocationCapture
                supabase={supabase}
                userId={user.id}
                onSaved={(lat, lng) => {
                  setMyLocation({ lat, lng })
                  loadCandidates()
                }}
              />
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-xs text-emerald-300 font-bold">Localização definida</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {myLocation.lat.toFixed(3)}, {myLocation.lng.toFixed(3)}
                </p>
                <button
                  onClick={() => setMyLocation(null)}
                  className="mt-2 text-[10px] text-emerald-400 hover:underline"
                >
                  Atualizar
                </button>
              </div>
            )}

            <button
              onClick={loadCandidates}
              disabled={loadingCandidates}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${loadingCandidates ? 'animate-spin' : ''}`} />
              Atualizar lista
            </button>
          </aside>

          <main>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">
                {success}
              </div>
            )}

            {view === 'map' ? (
              <div>
                {myLocation || candidates.some((c) => c.lat != null) ? (
                  <>
                    <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#020617]"></span> Você</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#020617]"></span> Candidato</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border-2 border-[#020617]"></span> Member Plus</span>
                      </div>
                      <span>{candidates.length} {candidates.length === 1 ? 'candidato' : 'candidatos'} no raio</span>
                    </div>
                    <MatchMap
                      center={mapCenter}
                      zoom={mapZoom}
                      markers={mapMarkers}
                      height="540px"
                    />
                  </>
                ) : (
                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <MapIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-300 font-bold mb-1">Mapa indisponível sem localização</p>
                    <p className="text-slate-500 text-sm">Capture sua localização para ver o mapa de candidatos.</p>
                  </div>
                )}
                <p className="text-center text-xs text-slate-500 mt-3">
                  <Sparkles className="w-3 h-3 inline" /> Mapa interativo via OpenStreetMap. Clique nos pinos para ver detalhes.
                </p>
              </div>
            ) : loadingCandidates ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
                <p className="text-slate-400">Buscando candidatos...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
                <Search className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-300 font-bold mb-1">Nenhum candidato por perto</p>
                <p className="text-slate-500 text-sm">Tente aumentar o raio de busca ou salvar sua localização.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.map((c) => (
                  <SwipeCard
                    key={c.id}
                    candidate={c}
                    onPropose={handlePropose}
                    onSkip={handleSkip}
                    loading={proposingId === c.id}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
