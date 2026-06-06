'use client';
import { useState } from 'react';
import { Loader2, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  getCurrentPosition,
  isValidCoordinate,
  saveUserLocation,
} from '@/lib/geolocation';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import type { PlaceResult } from '@/lib/google-places';

type LocationState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | {
      kind: 'success'
      lat: number
      lng: number
      source: 'gps' | 'geocode'
      cidade?: string
      estado?: string
      endereco?: string
    }
  | { kind: 'error'; message: string };

type SupabaseLike = {
  from: (table: string) => any
}

type Props = {
  supabase: SupabaseLike
  userId: string
  onSaved?: (lat: number, lng: number, place?: PlaceResult) => void
  /** Mantidos para compatibilidade (ignorados — AddressAutocomplete cuida) */
  initialCidade?: string
  initialEstado?: string
  /** Esconder GPS button (útil em fluxos que só querem texto) */
  hideGpsButton?: boolean
  /** Label customizado do campo de endereço */
  addressLabel?: string
}

export default function LocationCapture({
  supabase,
  userId,
  onSaved,
  initialCidade: _initialCidade = '',
  initialEstado: _initialEstado = '',
  hideGpsButton = false,
  addressLabel = 'Endereço completo',
}: Props) {
  const [state, setState] = useState<LocationState>({ kind: 'idle' })
  const [saving, setSaving] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)

  const captureGPS = async () => {
    setState({ kind: 'loading' })
    try {
      const pos = await getCurrentPosition({ timeoutMs: 10_000 })
      if (!isValidCoordinate(pos.lat, pos.lng)) {
        setState({ kind: 'error', message: 'Coordenada inválida retornada pelo navegador.' })
        return
      }
      await persist(pos.lat, pos.lng, 'browser')
    } catch (err: any) {
      setState({
        kind: 'error',
        message: err?.message || 'Não foi possível obter sua localização. Tente a busca manual.',
      })
    }
  }

  const handleAddressSelect = (place: PlaceResult) => {
    setSelectedPlace(place)
    if (place.lat == null || place.lng == null) {
      setState({ kind: 'error', message: 'Endereço sem coordenadas. Tente outro.' })
      return
    }
    if (!isValidCoordinate(place.lat, place.lng)) {
      setState({ kind: 'error', message: 'Coordenada inválida retornada pelo serviço de mapas.' })
      return
    }
    void persist(place.lat, place.lng, 'geocoded', place)
  }

  const persist = async (
    lat: number,
    lng: number,
    source: 'browser' | 'geocoded',
    place?: PlaceResult,
  ) => {
    setSaving(true)
    try {
      const cidade = place?.components?.city
      const estado = place?.components?.stateCode
      const endereco = place?.formattedAddress
      const cep = place?.components?.postalCode

      const result = await saveUserLocation(
        supabase,
        userId,
        lat,
        lng,
        cidade,
        estado,
        undefined,
        source,
        endereco,
        cep,
      )

      if (!result.success) {
        setState({ kind: 'error', message: result.message || 'Erro ao salvar localização.' })
        return
      }

      setState({ kind: 'success', lat, lng, source: source === 'browser' ? 'gps' : 'geocode', cidade, estado, endereco })
      onSaved?.(lat, lng, place)
    } catch (err: any) {
      setState({ kind: 'error', message: err?.message || 'Erro ao salvar localização.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">Sua localização</h3>
      </div>

      {state.kind === 'success' ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-300 text-sm font-bold">Localização salva</p>
          </div>
          {state.endereco && (
            <p className="text-white text-sm">{state.endereco}</p>
          )}
          <p className="text-slate-400 text-xs mt-0.5">
            {state.cidade && state.estado ? `${state.cidade}, ${state.estado} • ` : ''}
            {state.lat.toFixed(4)}, {state.lng.toFixed(4)}
            {' • '}
            {state.source === 'gps' ? 'GPS' : 'endereço selecionado'}
          </p>
          <button
            onClick={() => {
              setState({ kind: 'idle' })
              setSelectedPlace(null)
            }}
            className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 underline"
          >
            Atualizar
          </button>
        </div>
      ) : (
        <>
          <AddressAutocomplete
            label={addressLabel}
            placeholder="Digite seu endereço, cidade ou CEP..."
            showGpsButton={!hideGpsButton}
            onGpsClick={captureGPS}
            onSelect={handleAddressSelect}
            disabled={state.kind === 'loading' || saving}
          />

          {saving && (
            <div className="mt-3 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center gap-2 text-xs text-blue-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Salvando localização...
            </div>
          )}

          {state.kind === 'loading' && !saving && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Obtendo coordenadas...
            </div>
          )}
        </>
      )}

      {state.kind === 'error' && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-xs">{state.message}</p>
        </div>
      )}
    </div>
  )
}
