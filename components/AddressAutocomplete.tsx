'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Search, Loader2, X, CheckCircle2, Globe, AlertCircle, Sparkles } from 'lucide-react';
import {
  unifiedAutocomplete,
  unifiedPlaceDetails,
  isGooglePlacesEnabled,
  getActiveProvider,
  type AutocompleteSuggestion,
  type PlaceResult,
} from '@/lib/google-places';

type Props = {
  /** Valor atual (endereço formatado) - controlled */
  value?: string
  /** Callback ao mudar o texto digitado */
  onChange?: (text: string) => void
  /** Callback quando o usuário SELECIONA uma sugestão (resolve com lat/lng) */
  onSelect?: (place: PlaceResult) => void
  /** Placeholder do input */
  placeholder?: string
  /** Label visível acima */
  label?: string
  /** Classes extras do container */
  className?: string
  /** Mostrar botão "usar GPS" também */
  showGpsButton?: boolean
  /** Callback do botão GPS (LocationCapture legacy) */
  onGpsClick?: () => void
  /** Disabled */
  disabled?: boolean
  /** Apenas cidades (restringe tipos) */
  citiesOnly?: boolean
}

const DEBOUNCE_MS = 350
const MIN_CHARS = 3

export default function AddressAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Digite seu endereço, cidade ou CEP...',
  label,
  className = '',
  showGpsButton = false,
  onGpsClick,
  disabled = false,
  citiesOnly = false,
}: Props) {
  const [input, setInput] = useState(value)
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState<number>(-1)
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [error, setError] = useState('')

  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const provider = getActiveProvider()
  const usingGoogle = isGooglePlacesEnabled()

  // Sincronizar com prop externa
  useEffect(() => {
    if (value !== input) {
      setInput(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (text.trim().length < MIN_CHARS) {
        setSuggestions([])
        setLoading(false)
        return
      }
      // Cancelar requisição anterior
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      setLoading(true)
      setError('')
      try {
        const { suggestions: results } = await unifiedAutocomplete(text, {
          signal: abortRef.current.signal,
        })
        // Filtrar cidades se solicitado (heurística simples)
        const filtered = citiesOnly
          ? results.filter((s) => !/\d/.test(s.mainText) || /[a-zA-Z]/.test(s.secondaryText))
          : results
        setSuggestions(filtered)
        setOpen(true)
        setHighlighted(-1)
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError('Erro ao buscar endereços.')
          setSuggestions([])
        }
      } finally {
        setLoading(false)
      }
    },
    [citiesOnly],
  )

  const handleInputChange = (text: string) => {
    setInput(text)
    setSelectedPlace(null)
    onChange?.(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(text), DEBOUNCE_MS)
  }

  const handleSelectSuggestion = async (s: AutocompleteSuggestion) => {
    setInput(s.mainText + (s.secondaryText ? `, ${s.secondaryText}` : ''))
    setOpen(false)
    setSuggestions([])
    setHighlighted(-1)
    onChange?.(s.mainText)

    // Se Nominatim já tem o place completo (no autocomplete), usa direto
    if (s.place) {
      setSelectedPlace(s.place)
      onSelect?.(s.place)
      return
    }

    // Se Google, busca detalhes
    setLoading(true)
    try {
      const place = await unifiedPlaceDetails(s.id)
      if (place) {
        setSelectedPlace(place)
        setInput(place.formattedAddress)
        onChange?.(place.formattedAddress)
        onSelect?.(place)
      }
    } catch {
      setError('Não foi possível obter detalhes do endereço.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setOpen(true)
        // dispara busca
        if (input.length >= MIN_CHARS) fetchSuggestions(input)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => (h < suggestions.length - 1 ? h + 1 : h))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => (h > 0 ? h - 1 : 0))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      void handleSelectSuggestion(suggestions[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  const handleClear = () => {
    setInput('')
    setSelectedPlace(null)
    setSuggestions([])
    setOpen(false)
    onChange?.('')
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> {label}
        </label>
      )}

      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true)
            }}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 animate-spin" />
          )}
          {!loading && input && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white"
              aria-label="Limpar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {showGpsButton && onGpsClick && (
          <button
            type="button"
            onClick={onGpsClick}
            className="px-3 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold transition flex items-center gap-1.5 text-xs whitespace-nowrap"
            title="Usar GPS"
          >
            <MapPin className="w-4 h-4" /> GPS
          </button>
        )}
      </div>

      {/* Provider badge */}
      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
        {usingGoogle ? (
          <><Sparkles className="w-3 h-3 text-blue-400" /> Google Places · precisão premium</>
        ) : (
          <><Globe className="w-3 h-3" /> OpenStreetMap · 100% gratuito</>
        )}
      </div>

      {/* Selected place confirmation */}
      {selectedPlace && (
        <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-200 font-bold">Localização confirmada</p>
            <p className="text-[11px] text-emerald-100/80 truncate">{selectedPlace.formattedAddress}</p>
            {selectedPlace.components.city && (
              <p className="text-[10px] text-emerald-100/60">
                {selectedPlace.components.city}
                {selectedPlace.components.stateCode ? `, ${selectedPlace.components.stateCode}` : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-xl bg-slate-900 border border-white/20 shadow-2xl shadow-black/50">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSuggestion(s)}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full text-left px-3 py-2.5 flex items-start gap-2 border-b border-white/5 last:border-b-0 transition ${
                highlighted === i ? 'bg-emerald-500/15' : 'hover:bg-white/5'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${highlighted === i ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm truncate ${highlighted === i ? 'text-emerald-200' : 'text-white'}`}>
                  {s.mainText}
                </p>
                {s.secondaryText && (
                  <p className="text-[11px] text-slate-400 truncate">{s.secondaryText}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {open && !loading && input.length >= MIN_CHARS && suggestions.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 p-3 rounded-xl bg-slate-900 border border-white/20 text-xs text-slate-400 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          Nenhum resultado para &ldquo;{input}&rdquo;.
        </div>
      )}

      {error && (
        <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </div>
      )}
    </div>
  )
}
