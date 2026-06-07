'use client'

// ============================================================
// LocationCard — Mostra status da localização (definida ou
// pendente) com botão de atualizar.
// ============================================================

import LocationCapture from '@/components/LocationCapture'
import { formatCoord } from '../_utils/format'

interface LocationCardProps {
  supabase: any
  userId: string
  myLocation: { lat: number; lng: number } | null
  onSaved: (lat: number, lng: number) => void
  onClear: () => void
}

export function LocationCard({
  supabase,
  userId,
  myLocation,
  onSaved,
  onClear,
}: LocationCardProps) {
  if (!myLocation) {
    return <LocationCapture supabase={supabase} userId={userId} onSaved={onSaved} />
  }

  return (
    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
      <p className="text-xs text-emerald-300 font-bold">Localização definida</p>
      <p className="text-[10px] text-slate-400 mt-0.5">
        {formatCoord(myLocation.lat)}, {formatCoord(myLocation.lng)}
      </p>
      <button
        onClick={onClear}
        className="mt-2 text-[10px] text-emerald-400 hover:underline"
      >
        Atualizar
      </button>
    </div>
  )
}
