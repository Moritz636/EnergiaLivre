'use client';
import { useState } from 'react';
import { Heart, X, Loader2, MapPin, Zap, Building2, User as UserIcon, CheckCircle2, Sparkles, Send } from 'lucide-react';

export type MatchCandidateData = {
  id: string
  nome: string
  cidade?: string
  estado?: string
  capacidadeKwp?: number
  distanciaKm?: number | null
  // tipo='gerador' ou 'consumidor'
  tipo: 'gerador' | 'consumidor'
  // extras opcionais
  economiaEstimada?: string
  mensalidadeEstimada?: string
}

type Props = {
  candidate: MatchCandidateData
  onPropose: (candidate: MatchCandidateData) => Promise<void> | void
  onSkip: (candidate: MatchCandidateData) => void
  loading?: boolean
}

export default function SwipeCard({ candidate, onPropose, onSkip, loading }: Props) {
  const [actionLoading, setActionLoading] = useState<'propose' | 'skip' | null>(null)

  const handlePropose = async () => {
    if (loading || actionLoading) return
    setActionLoading('propose')
    try {
      await onPropose(candidate)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSkip = () => {
    if (loading || actionLoading) return
    setActionLoading('skip')
    try {
      onSkip(candidate)
    } finally {
      setActionLoading(null)
    }
  }

  const Icon = candidate.tipo === 'gerador' ? Building2 : UserIcon
  const accent = candidate.tipo === 'gerador' ? 'blue' : 'emerald'

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-${accent}-500/20 flex items-center justify-center shrink-0`}>
          <Icon className={`w-7 h-7 text-${accent}-400`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white truncate">{candidate.nome}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-${accent}-500/20 text-${accent}-400 uppercase`}>
              {candidate.tipo}
            </span>
          </div>
          {candidate.cidade && candidate.estado && (
            <p className="text-slate-400 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {candidate.cidade}, {candidate.estado}
            </p>
          )}
        </div>
        {candidate.distanciaKm != null && (
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-500">Distância</p>
            <p className="text-sm font-bold text-white">{candidate.distanciaKm.toFixed(1)} km</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {candidate.capacidadeKwp != null && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Capacidade
            </p>
            <p className="text-sm font-bold text-white mt-0.5">{candidate.capacidadeKwp} kWp</p>
          </div>
        )}
        {candidate.economiaEstimada && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Economia
            </p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">{candidate.economiaEstimada}</p>
          </div>
        )}
        {candidate.mensalidadeEstimada && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2">
            <p className="text-xs text-slate-500">Mensalidade estimada</p>
            <p className="text-base font-bold text-white mt-0.5">{candidate.mensalidadeEstimada}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSkip}
          disabled={!!actionLoading || loading}
          className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {actionLoading === 'skip' ? (
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
          className={`flex-1 py-3 rounded-xl bg-gradient-to-r from-${accent}-500 to-${accent}-600 hover:from-${accent}-400 hover:to-${accent}-500 text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-${accent}-500/20`}
        >
          {actionLoading === 'propose' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" /> Propor Match
            </>
          )}
        </button>
      </div>
    </div>
  )
}
