'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, MapPin, Camera } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAuth } from '@/app/hooks/useAuth'
import LocationCapture from '@/components/LocationCapture'
import { getSupabase } from '@/lib/supabase/singleton'

const InvoiceScanner = dynamic(() => import('@/components/Invoice/InvoiceScanner'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-slate-900 rounded-2xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
  ),
})

interface ScanResult {
  invoice: { id: string; kwh_mensal: number | null; match_eligible: boolean; valor_total: number | null; vencimento: string | null }
  parsed: { tipo: string; valor: number | null; vencimento: string | null; documentId: string | null }
  message: string
}

export default function ScanInvoicePage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabase()
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState('')

  const handleScan = async (payload: string) => {
    if (!user) {
      setError('Você precisa estar logado.')
      return
    }
    setProcessing(true)
    setError('')
    try {
      const res = await fetch('/api/invoices/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcodePayload: payload,
          latitude: location?.lat,
          longitude: location?.lng,
          endereco: address || undefined,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Erro ao processar código')
        setProcessing(false)
        return
      }
      setScanResult(body)
    } catch (err: any) {
      setError(err?.message || 'Erro de rede')
    } finally {
      setProcessing(false)
    }
  }

  const handleViewInvoice = () => {
    if (scanResult?.invoice.id) {
      router.push(`/dashboard/faturas/${scanResult.invoice.id}`)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-slate-300 mb-4">Você precisa estar logado para escanear faturas.</p>
          <Link href="/login?redirect=/dashboard/faturas/scan" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-900 font-bold">
            Entrar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard/faturas" className="p-2 rounded-lg hover:bg-white/5" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white">Escanear Fatura</h1>
            <p className="text-[10px] text-slate-400">QR Code ou código de barras</p>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-3xl mx-auto">
        {!scanResult ? (
          <>
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-300 flex items-center gap-2">
                <Camera className="w-3.5 h-3.5" />
                <span>
                  <strong>Como funciona:</strong> Aponte a câmera para o QR Code / código de barras da sua fatura.
                  Se sua fatura tiver <strong>consumo ≥ 300 kWh</strong>, você aparece no mapa de match automaticamente.
                </span>
              </p>
            </div>

            <InvoiceScanner onScan={handleScan} />

            {!location && (
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-300 font-bold mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Localização (opcional)
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Adicione sua localização para que geradores próximos vejam sua fatura no mapa.
                </p>
                <LocationCapture
                  supabase={supabase}
                  userId={user.id}
                  onSaved={(lat, lng, place) => {
                    setLocation({ lat, lng })
                    if (place?.formattedAddress) setAddress(place.formattedAddress)
                  }}
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {processing && (
              <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando código...
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Fatura cadastrada!</h2>
                <p className="text-sm text-slate-300">{scanResult.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-500 uppercase">Valor</p>
                <p className="text-base font-bold text-white">
                  {scanResult.parsed.valor !== null
                    ? `R$ ${scanResult.parsed.valor.toFixed(2)}`
                    : '—'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-500 uppercase">Vencimento</p>
                <p className="text-base font-bold text-white">
                  {scanResult.parsed.vencimento
                    ? new Date(scanResult.parsed.vencimento).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-500 uppercase">Consumo estimado</p>
                <p className="text-base font-bold text-white">
                  {scanResult.invoice.kwh_mensal ? `${scanResult.invoice.kwh_mensal} kWh` : '—'}
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${scanResult.invoice.match_eligible ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                <p className="text-[10px] text-slate-500 uppercase">Match no mapa</p>
                <p className={`text-base font-bold ${scanResult.invoice.match_eligible ? 'text-emerald-300' : 'text-white'}`}>
                  {scanResult.invoice.match_eligible ? '✓ Sim' : '— Não'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleViewInvoice}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold transition"
              >
                Ver detalhes
              </button>
              <Link
                href="/dashboard/match"
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition text-center"
              >
                Ver matches
              </Link>
            </div>

            <button
              onClick={() => setScanResult(null)}
              className="mt-3 w-full text-xs text-slate-400 hover:text-white"
            >
              Escanear outra fatura
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
