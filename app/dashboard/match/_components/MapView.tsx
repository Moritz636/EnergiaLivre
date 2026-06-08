'use client'

import dynamic from 'next/dynamic'
import { Loader2, Map as MapIcon, Crosshair, Navigation } from 'lucide-react'
import type { MapMarker, MapCircle } from '@/components/Map/MatchMap'
import { plural } from '../_utils/format'

const MatchMap = dynamic(() => import('@/components/Map/MatchMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Carregando mapa...</p>
      </div>
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
  radiusKm: number
}

export function MapView({
  myLocation,
  hasCandidatesWithCoords,
  candidatesCount,
  mapCenter,
  mapZoom,
  mapMarkers,
  radiusKm,
}: MapViewProps) {
  const hasContent = myLocation || hasCandidatesWithCoords

  const circle: MapCircle | null = myLocation
    ? { center: [myLocation.lat, myLocation.lng], radiusMeters: radiusKm * 1000 }
    : null

  if (!hasContent) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <MapIcon className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-300 font-bold mb-1">Mapa indisponível</p>
          <p className="text-slate-500 text-sm leading-relaxed">
            Capture sua localização no painel ao lado para ativar o mapa interativo com todos os candidatos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Stats bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02] border border-white/10 rounded-2xl mb-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Navigation className="w-3 h-3 text-blue-400" />
            <span>{candidatesCount} {plural(candidatesCount, 'candidato')} encontrado{candidatesCount === 1 ? '' : 's'}</span>
          </div>
          {myLocation && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Crosshair className="w-3 h-3 text-emerald-400" />
              <span>Raio de {radiusKm} km</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#020617]" title="Candidato" />
          <span className="text-[10px] text-slate-500">Candidato</span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border-2 border-[#020617]" title="PLUS" />
          <span className="text-[10px] text-slate-500">PLUS</span>
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#020617]" title="Você" />
          <span className="text-[10px] text-slate-500">Você</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0">
        <MatchMap
          center={mapCenter}
          zoom={mapZoom}
          markers={mapMarkers}
          height="100%"
          circle={circle}
          showAttribution={false}
        />
      </div>
    </div>
  )
}
