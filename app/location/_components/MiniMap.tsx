'use client'

// ============================================================
// MiniMap — Mapa OpenStreetMap com marker do consumidor.
// Reusa MatchMap (leaflet, sem API key).
// ============================================================

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const MatchMap = dynamic(() => import('@/components/Map/MatchMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
    </div>
  ),
})

interface MiniMapProps {
  lat: number
  lng: number
  label?: string
}

export function MiniMap({ lat, lng, label = 'Sua localização' }: MiniMapProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <MatchMap
        center={[lat, lng]}
        zoom={10}
        markers={[
          {
            id: 'consumer',
            lat,
            lng,
            label,
            color: 'blue',
          },
        ]}
        height="280px"
      />
    </div>
  )
}
