'use client'

// ============================================================
// MatchMapView — Mapa com marcadores do consumidor e das
// usinas matchadas, com suporte a blur condicional.
// ============================================================

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const MatchMap = dynamic(() => import('@/components/Map/MatchMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
    </div>
  ),
})

import type { MatchItem } from './MatchResultsList'

interface MatchMapViewProps {
  consumer: { lat: number; lng: number; cidade?: string; estado?: string } | null
  matches: MatchItem[]
  blurred?: boolean
  selectedUsinaId?: string
  onSelectUsina?: (id: string) => void
}

const COLOR_FOR: Record<number, 'emerald' | 'yellow' | 'blue'> = {
  0: 'yellow',
  1: 'emerald',
  2: 'blue',
}

export function MatchMapView({ consumer, matches, blurred, selectedUsinaId, onSelectUsina }: MatchMapViewProps) {
  if (!consumer) {
    return (
      <div className="h-[420px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-center p-6">
        <div>
          <p className="text-sm text-slate-400">Capturando localização...</p>
        </div>
      </div>
    )
  }

  const markers = [
    {
      id: 'consumer',
      lat: consumer.lat,
      lng: consumer.lng,
      label: consumer.cidade
        ? `${consumer.cidade}/${consumer.estado} (sua localização)`
        : 'Sua localização',
      color: 'blue' as const,
      popupHtml: `<strong>Voce</strong><br/>${consumer.cidade ?? ''} ${consumer.estado ?? ''}`,
    },
    ...matches.map((m, idx) => ({
      id: m.usina.id,
      lat: -23.55 + (idx * 0.05),
      lng: -46.63 + (idx * 0.05),
      label: m.usina.nome,
      color: COLOR_FOR[idx] ?? 'emerald',
      popupHtml: `<strong>${m.usina.nome}</strong><br/>` +
        `Match score: <b>${m.match_score}</b><br/>` +
        `Economia/mes: <b>R$ ${m.economia_estimada_mensal.toFixed(2)}</b><br/>` +
        `Distancia: ${m.distance_km} km`,
    })),
  ]

  // Hack: como o mock nao tem lat/lng real, vou usar posicoes aleatorias
  // em torno do consumidor (15 km de offset). Isso e o unico lugar onde
  // o algoritmo de match ja retornou o `distance_km` correto.
  markers.slice(1).forEach((mk, idx) => {
    const angle = (idx * 120) * (Math.PI / 180)
    const offsetKm = matches[idx]?.distance_km ?? 10
    const dLat = (offsetKm / 111) * Math.cos(angle)
    const dLng = (offsetKm / (111 * Math.cos((consumer.lat * Math.PI) / 180))) * Math.sin(angle)
    mk.lat = consumer.lat + dLat
    mk.lng = consumer.lng + dLng
  })

  const center: [number, number] = [consumer.lat, consumer.lng]

  return (
    <div className="relative">
      <div
        className={blurred ? 'pointer-events-none select-none' : ''}
        aria-hidden={blurred}
      >
        <MatchMap
          center={center}
          zoom={blurred ? 8 : 9}
          markers={markers}
          height="420px"
          onMarkerClick={(id) => {
            if (id !== 'consumer') onSelectUsina?.(id)
          }}
        />
      </div>
      {blurred && (
        <div
          className="absolute inset-0 backdrop-blur-md bg-slate-950/40 flex items-center justify-center rounded-2xl"
          aria-label="Mapa bloqueado"
        >
          <div className="text-center px-4">
            <p className="text-sm font-black text-white">Mapa bloqueado</p>
            <p className="text-xs text-slate-300 mt-1">
              Desbloqueie o match completo para ver as usinas no mapa
            </p>
          </div>
        </div>
      )}
      {selectedUsinaId && !blurred && (
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-emerald-500/90 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-lg">
          Usina selecionada
        </div>
      )}
    </div>
  )
}
