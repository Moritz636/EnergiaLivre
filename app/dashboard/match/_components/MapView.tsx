'use client'

// ============================================================
// MapView — Renderiza o mapa com legenda, header de candidatos
// no raio e fallback quando não há localização.
// ============================================================

import dynamic from 'next/dynamic'
import { Loader2, Map as MapIcon, Sparkles } from 'lucide-react'
import type { MapMarker } from '@/components/Map/MatchMap'
import { plural } from '../_utils/format'

const MatchMap = dynamic(() => import('@/components/Map/MatchMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  ),
})

interface MapViewProps {
  myLocation: { lat: number; lng: number } | null
  hasCandidatesWithCoords: boolean
  candidatesCount: number
  mapCenter: [number, number]
  mapZoom: number
  mapMarkers: MapMarker[]
}

export function MapView({
  myLocation,
  hasCandidatesWithCoords,
  candidatesCount,
  mapCenter,
  mapZoom,
  mapMarkers,
}: MapViewProps) {
  const hasContent = myLocation || hasCandidatesWithCoords

  if (!hasContent) {
    return (
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
        <MapIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-300 font-bold mb-1">Mapa indisponível sem localização</p>
        <p className="text-slate-500 text-sm">
          Capture sua localização para ver o mapa de candidatos.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#020617]" />
            Você
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#020617]" />
            Candidato
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border-2 border-[#020617]" />
            Member Plus
          </span>
        </div>
        <span>
          {candidatesCount} {plural(candidatesCount, 'candidato')} no raio
        </span>
      </div>

      <MatchMap center={mapCenter} zoom={mapZoom} markers={mapMarkers} height="540px" />

      <p className="text-center text-xs text-slate-500 mt-3">
        <Sparkles className="w-3 h-3 inline" /> Mapa interativo via OpenStreetMap. Clique
        nos pinos para ver detalhes.
      </p>
    </div>
  )
}
