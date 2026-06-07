'use client'

// ============================================================
// MatchResultsList — Lista de usinas matchadas com score,
// economia, distancia e CTA por usina.
// ============================================================

import { Star, MapPin, TrendingDown, Zap, Award, CheckCircle2 } from 'lucide-react'

export interface MatchItem {
  usina: {
    id: string
    nome: string
    cidade: string
    estado: string
    subgrupo_tarifario: string
    distribuidora: string
    capacidade_kwp: number
    excedente_mensal_kwh: number
    valor_kwh_atual: number
    preco_oferta_kwh: number
    desconto_percentual: number
    media_avaliacoes: number
    total_avaliacoes: number
    destaque: string
  }
  distance_km: number
  economia_estimada_mensal: number
  economia_estimada_anual: number
  match_score: number
  motivos: string[]
}

interface MatchResultsListProps {
  matches: MatchItem[]
  onSelect?: (usinaId: string) => void
  selectedUsinaId?: string
  blurred?: boolean
}

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function MatchResultsList({ matches, onSelect, selectedUsinaId, blurred }: MatchResultsListProps) {
  if (matches.length === 0) {
    return (
      <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl">
        <p className="text-sm text-slate-400">
          Nenhuma usina compativel encontrada. Tente ajustar o consumo ou a regiao.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {matches.map((m, idx) => {
        const isSelected = selectedUsinaId === m.usina.id
        return (
          <li
            key={m.usina.id}
            className={`relative p-5 rounded-2xl border transition ${
              isSelected
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-white/5 border-white/10 hover:border-emerald-500/30'
            }`}
          >
            {idx === 0 && (
              <span className="absolute -top-2 left-5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-yellow-500 text-slate-900">
                <Award className="w-3 h-3" /> Melhor match
              </span>
            )}

            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-white truncate">
                  {m.usina.nome}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {m.usina.cidade}/{m.usina.estado} · {m.usina.distribuidora} · Subgrupo {m.usina.subgrupo_tarifario}
                </p>
                {m.usina.destaque && (
                  <p className="text-[11px] text-emerald-300 mt-1.5 italic">
                    {m.usina.destaque}
                  </p>
                )}
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  <span className="text-sm font-bold">
                    {m.usina.media_avaliacoes.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({m.usina.total_avaliacoes})
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">match score</p>
                <p className="text-2xl font-black text-emerald-400">
                  {m.match_score}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat label="Distancia" value={`${m.distance_km} km`} />
              <Stat label="Economia/mes" value={`R$ ${formatBRL(m.economia_estimada_mensal)}`} highlight />
              <Stat label="Economia/ano" value={`R$ ${formatBRL(m.economia_estimada_anual)}`} highlight />
              <Stat label="Desconto" value={`${m.usina.desconto_percentual}%`} />
            </div>

            {m.motivos.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {m.motivos.map((motivo, i) => (
                  <li
                    key={i}
                    className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-white/5 border border-white/10 rounded-full px-2 py-0.5"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> {motivo}
                  </li>
                ))}
              </ul>
            )}

            {!blurred && onSelect && (
              <button
                onClick={() => onSelect(m.usina.id)}
                className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" /> Selecionar esta usina
              </button>
            )}

            {blurred && (
              <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-white/5 text-center text-[11px] text-slate-500">
                <TrendingDown className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                Desbloqueie para ver detalhes de preco kWh e conectar-se a esta usina
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-2 rounded-lg bg-slate-900/40 border border-white/5">
      <p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-sm font-black ${highlight ? 'text-emerald-300' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}
