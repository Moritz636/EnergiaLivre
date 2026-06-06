'use client';
import { useState, useRef, useEffect } from 'react';
import { Heart, X, Loader2, MapPin, Zap, Building2, User as UserIcon, CheckCircle2, Sparkles, Send, Star, TrendingDown, Award } from 'lucide-react';

export type MatchCandidateData = {
  id: string
  nome: string
  cidade?: string
  estado?: string
  capacidadeKwp?: number
  distanciaKm?: number | null
  lat?: number | null
  lng?: number | null
  isMemberPlus?: boolean
  tipo: 'gerador' | 'consumidor'
  economiaEstimada?: string
  mensalidadeEstimada?: string
  // Novos campos
  precoKwh?: number | null
  descontoPercentual?: number | null
  pacoteKwh?: number | null
  pacotePreco?: number | null
  rankingScore?: number | null
  totalAvaliacoes?: number | null
  mediaAvaliacoes?: number | null
}

type Props = {
  candidate: MatchCandidateData
  onPropose: (candidate: MatchCandidateData) => Promise<void> | void
  onSkip: (candidate: MatchCandidateData) => void
  loading?: boolean
  /** Ativa swipe gestures (padrão true) */
  swipeEnabled?: boolean
}

const SWIPE_THRESHOLD = 100

export default function SwipeCard({ candidate, onPropose, onSkip, loading, swipeEnabled = true }: Props) {
  const [actionLoading, setActionLoading] = useState<'propose' | 'skip' | null>(null)
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)

  const cardRef = useRef<HTMLDivElement | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const Icon = candidate.tipo === 'gerador' ? Building2 : UserIcon
  // Cores estáticas (não dinâmicas) para evitar purge do Tailwind
  const accentClasses = candidate.tipo === 'gerador'
    ? { ring: 'border-blue-500/30', bg: 'bg-blue-500/15', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' }
    : { ring: 'border-emerald-500/30', bg: 'bg-emerald-500/15', text: 'text-emerald-400', gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' }

  const handlePropose = async () => {
    if (loading || actionLoading) return
    setActionLoading('propose')
    setExitDir('right')
    setTimeout(async () => {
      try {
        await onPropose(candidate)
      } finally {
        setActionLoading(null)
      }
    }, 250)
  }

  const handleSkip = () => {
    if (loading || actionLoading) return
    setActionLoading('skip')
    setExitDir('left')
    setTimeout(() => {
      onSkip(candidate)
      setActionLoading(null)
    }, 250)
  }

  // Swipe handlers
  useEffect(() => {
    if (!swipeEnabled) return
    const el = cardRef.current
    if (!el) return

    const onPointerDown = (e: PointerEvent) => {
      if (loading || actionLoading) return
      startRef.current = { x: e.clientX, y: e.clientY }
      setIsDragging(true)
      el.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!startRef.current || !isDragging) return
      const dx = e.clientX - startRef.current.x
      const dy = e.clientY - startRef.current.y
      setDragX(dx)
      setDragY(dy * 0.3) // reduzir movimento vertical
    }

    const onPointerUp = () => {
      if (!isDragging) return
      setIsDragging(false)
      if (dragX > SWIPE_THRESHOLD) {
        handlePropose()
      } else if (dragX < -SWIPE_THRESHOLD) {
        handleSkip()
      } else {
        setDragX(0)
        setDragY(0)
      }
      startRef.current = null
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
    }
  }, [swipeEnabled, isDragging, dragX, dragY, loading, actionLoading])

  const rotation = isDragging ? dragX / 15 : 0
  const opacity = isDragging ? Math.max(0.7, 1 - Math.abs(dragX) / 400) : 1
  const stampOpacityLeft = Math.min(1, Math.max(0, -dragX / SWIPE_THRESHOLD))
  const stampOpacityRight = Math.min(1, Math.max(0, dragX / SWIPE_THRESHOLD))

  const exitTransform = exitDir === 'right'
    ? 'translate(120%, 0) rotate(20deg)'
    : exitDir === 'left'
      ? 'translate(-120%, 0) rotate(-20deg)'
      : `translate(${dragX}px, ${dragY}px) rotate(${rotation}deg)`

  return (
    <div
      ref={cardRef}
      className={`relative p-6 rounded-2xl bg-white/5 border ${accentClasses.ring} select-none touch-none`}
      style={{
        transform: exitTransform,
        opacity: exitDir ? 0 : opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {/* Stamps de LIKE/NOPE (Tinder-like) */}
      {stampOpacityLeft > 0 && (
        <div
          className="absolute top-6 right-6 px-3 py-1.5 rounded-lg border-2 border-red-500 text-red-500 font-black text-sm rotate-12 pointer-events-none z-10"
          style={{ opacity: stampOpacityLeft }}
        >
          PULAR
        </div>
      )}
      {stampOpacityRight > 0 && (
        <div
          className="absolute top-6 left-6 px-3 py-1.5 rounded-lg border-2 border-emerald-500 text-emerald-500 font-black text-sm -rotate-12 pointer-events-none z-10"
          style={{ opacity: stampOpacityRight }}
        >
          CONECTAR
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className={`w-16 h-16 rounded-2xl ${accentClasses.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-8 h-8 ${accentClasses.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-bold text-white truncate">{candidate.nome}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${accentClasses.bg} ${accentClasses.text} uppercase`}>
              {candidate.tipo}
            </span>
            {candidate.isMemberPlus && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-yellow-500 text-slate-900">
                PLUS
              </span>
            )}
          </div>
          {candidate.cidade && candidate.estado && (
            <p className="text-slate-400 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {candidate.cidade}, {candidate.estado}
            </p>
          )}
        </div>
        {candidate.distanciaKm != null && (
          <div className="text-right shrink-0">
            <p className="text-[10px] text-slate-500 uppercase">Distância</p>
            <p className="text-base font-bold text-white">{candidate.distanciaKm.toFixed(1)} <span className="text-xs text-slate-400">km</span></p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {candidate.capacidadeKwp != null && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-slate-500 flex items-center gap-1 uppercase font-bold">
              <Zap className="w-3 h-3" /> Capacidade
            </p>
            <p className="text-sm font-bold text-white mt-0.5">{candidate.capacidadeKwp} kWp</p>
          </div>
        )}
        {candidate.precoKwh != null && (
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <p className="text-[10px] text-blue-300 flex items-center gap-1 uppercase font-bold">
              <TrendingDown className="w-3 h-3" /> Preço kWh
            </p>
            <p className="text-sm font-bold text-blue-300 mt-0.5">
              R$ {candidate.precoKwh.toFixed(4)}
            </p>
          </div>
        )}
        {candidate.descontoPercentual != null && (
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-[10px] text-emerald-300 flex items-center gap-1 uppercase font-bold">
              <Award className="w-3 h-3" /> Desconto
            </p>
            <p className="text-sm font-bold text-emerald-300 mt-0.5">
              {candidate.descontoPercentual.toFixed(1)}% OFF
            </p>
          </div>
        )}
        {candidate.mediaAvaliacoes != null && candidate.totalAvaliacoes != null && candidate.totalAvaliacoes > 0 && (
          <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <p className="text-[10px] text-yellow-300 flex items-center gap-1 uppercase font-bold">
              <Star className="w-3 h-3" /> Avaliação
            </p>
            <p className="text-sm font-bold text-yellow-300 mt-0.5">
              {candidate.mediaAvaliacoes.toFixed(1)} <span className="text-[10px] text-slate-400">({candidate.totalAvaliacoes})</span>
            </p>
          </div>
        )}
        {candidate.pacoteKwh != null && candidate.pacotePreco != null && (
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 col-span-2">
            <p className="text-[10px] text-purple-300 uppercase font-bold">Pacote destaque</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {candidate.pacoteKwh} kWh por <span className="text-purple-300">R$ {candidate.pacotePreco.toFixed(2)}</span>
            </p>
          </div>
        )}
        {candidate.economiaEstimada && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2">
            <p className="text-[10px] text-slate-500 flex items-center gap-1 uppercase font-bold">
              <Sparkles className="w-3 h-3" /> Economia estimada
            </p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">{candidate.economiaEstimada}</p>
          </div>
        )}
      </div>

      {swipeEnabled && !loading && !actionLoading && (
        <p className="text-[10px] text-slate-500 text-center mb-3 hidden sm:block">
          ← deslize para pular · deslize para →
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSkip}
          disabled={!!actionLoading || loading}
          className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
        >
          {actionLoading === 'skip' || exitDir === 'left' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <X className="w-4 h-4" /> Pular
            </>
          )}
        </button>
        <button
          onClick={handlePropose}
          disabled={!!actionLoading || loading}
          className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${accentClasses.gradient} text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg ${accentClasses.shadow} active:scale-95`}
        >
          {actionLoading === 'propose' || exitDir === 'right' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" /> Conectar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
