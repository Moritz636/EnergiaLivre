'use client'

// ============================================================
// LocationForm — Formulario para captura de dados da fatura
// e georreferenciamento do consumidor. Usado em /location.
// ============================================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, FileText, Loader2, Sparkles } from 'lucide-react'
import { MOCK_DISTRIBUIDORAS, SUBGRUPOS } from '@/lib/mock-usinas'

export interface FaturaData {
  cidade: string
  estado: string
  distribuidora: string
  subgrupo_tarifario: string
  consumo_kwh_medio: number
  valor_kwh_atual: number
  cep: string
  endereco: string
  lat: number
  lng: number
}

interface LocationFormProps {
  onSubmit: (data: FaturaData) => void | Promise<void>
  onCoordsChange?: (coords: { lat: number; lng: number } | null) => void
  loading?: boolean
}

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export function LocationForm({ onSubmit, onCoordsChange, loading }: LocationFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    endereco: '',
    cep: '',
    cidade: '',
    estado: 'SP',
    distribuidora: 'Enel SP',
    subgrupo_tarifario: 'B1',
    consumo_kwh_medio: 500,
    valor_kwh_atual: 0.95,
  })
  const [geocoding, setGeocoding] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState('')

  const geocodeAddress = async (address?: string, cep?: string) => {
    setGeocoding(true)
    setError('')
    try {
      const res = await fetch('/api/mock/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endereco: address, cep }),
      })
      if (!res.ok) throw new Error('Falha no geocode')
      const json = (await res.json()) as { lat: number; lng: number; cidade: string; estado: string; message?: string }
      const newCoords = { lat: json.lat, lng: json.lng }
      setCoords(newCoords)
      onCoordsChange?.(newCoords)
      // Preenche cidade/estado se vierem do geocode
      if (json.cidade && !form.cidade) {
        setForm((f) => ({ ...f, cidade: json.cidade, estado: json.estado }))
      }
      return { lat: json.lat, lng: json.lng, cidade: json.cidade, estado: json.estado, message: json.message }
    } catch (err: any) {
      setError(err?.message ?? 'Erro no geocode')
      return null
    } finally {
      setGeocoding(false)
    }
  }

  const useExample = async () => {
    setError('')
    setGeocoding(true)
    try {
      const res = await fetch('/api/mock/fatura-exemplo', { method: 'POST' })
      const json = (await res.json()) as { fatura: FaturaData }
      const f = json.fatura
      setForm({
        endereco: f.endereco,
        cep: f.cep,
        cidade: f.cidade,
        estado: f.estado,
        distribuidora: f.distribuidora,
        subgrupo_tarifario: f.subgrupo_tarifario,
        consumo_kwh_medio: f.consumo_kwh_medio,
        valor_kwh_atual: f.valor_kwh_atual,
      })
      setCoords({ lat: f.lat, lng: f.lng })
      onCoordsChange?.({ lat: f.lat, lng: f.lng })
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar exemplo')
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.cidade || !form.estado) {
      setError('Cidade e estado sao obrigatorios')
      return
    }
    if (form.consumo_kwh_medio <= 0) {
      setError('Informe um consumo valido')
      return
    }

    let pos = coords
    if (!pos) {
      const geo = await geocodeAddress(form.endereco, form.cep)
      if (geo) pos = { lat: geo.lat, lng: geo.lng }
    }
    if (!pos) {
      setError('Não foi possível geocodificar o endereço')
      return
    }

    await onSubmit({
      ...form,
      lat: pos.lat,
      lng: pos.lng,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={useExample}
          disabled={geocoding}
          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3 h-3" /> Usar fatura de exemplo
        </button>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
          Endereço (rua, número)
        </label>
        <div className="flex gap-2">
          <input
            value={form.endereco}
            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            placeholder="Av. Paulista, 1000"
            className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none"
          />
          <button
            type="button"
            onClick={() => geocodeAddress(form.endereco, form.cep)}
            disabled={geocoding || !form.endereco}
            className="px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-sm font-bold transition disabled:opacity-40"
            aria-label="Geocodificar"
          >
            {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">CEP</label>
          <input
            value={form.cep}
            onChange={(e) => setForm({ ...form, cep: e.target.value })}
            placeholder="01310-100"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Cidade</label>
          <input
            required
            value={form.cidade}
            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
            placeholder="Sao Paulo"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">UF</label>
          <select
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 outline-none appearance-none"
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Distribuidora</label>
          <select
            value={form.distribuidora}
            onChange={(e) => setForm({ ...form, distribuidora: e.target.value })}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 outline-none appearance-none"
          >
            {MOCK_DISTRIBUIDORAS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Subgrupo tarifario</label>
          <select
            value={form.subgrupo_tarifario}
            onChange={(e) => setForm({ ...form, subgrupo_tarifario: e.target.value })}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 outline-none appearance-none"
          >
            {SUBGRUPOS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
            Consumo medio (kWh/mes)
          </label>
          <input
            type="number"
            required
            min={1}
            value={form.consumo_kwh_medio}
            onChange={(e) => setForm({ ...form, consumo_kwh_medio: Number(e.target.value) })}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
            Valor atual do kWh (R$)
          </label>
          <input
            type="number"
            required
            min={0.01}
            step={0.01}
            value={form.valor_kwh_atual}
            onChange={(e) => setForm({ ...form, valor_kwh_atual: Number(e.target.value) })}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {coords && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          Localizacao capturada: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || geocoding}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 font-black text-base transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Buscando usinas...
          </>
        ) : (
          <>
            Buscar usinas compativeis
          </>
        )}
      </button>
    </form>
  )
}
