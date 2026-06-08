'use client'

// ============================================================
// /location — Pagina publica de captura de dados da fatura
// e georreferenciamento. Apos submit, redireciona para
// /match?preview=true com os dados no sessionStorage.
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, FileSearch, ShieldCheck, Zap } from 'lucide-react'
import { LocationForm, type FaturaData } from './_components/LocationForm'
import { MiniMap } from './_components/MiniMap'

export default function LocationPage() {
  const router = useRouter()
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: FaturaData) => {
    setLoading(true)
    try {
      // Salva no sessionStorage para o /match ler
      sessionStorage.setItem('match_preview_payload', JSON.stringify(data))
      const params = new URLSearchParams({ preview: '1' })
      router.push(`/match?${params.toString()}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      <div
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20"
        aria-hidden
      />
      <div
        className="fixed top-1/3 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] -z-10"
        aria-hidden
      />

      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-base font-black text-white tracking-tight">
            ENERGIA<span className="text-emerald-400">LIVRE</span>
          </a>
          <a
            href="/login?from=location"
            className="text-sm text-slate-300 hover:text-white transition"
          >
            Ja tenho conta
          </a>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider text-emerald-300">
            <Zap className="w-3 h-3" /> Passo 1 de 2
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight">
            Encontre a usina <span className="text-emerald-400">perfeita</span> para você
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto">
            Informe os dados da sua fatura de energia. Vamos cruzar com nosso
            banco de geradoras e mostrar quem pode economizar mais para você.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-5">
              <FileSearch className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Dados da sua fatura</h2>
            </div>
            <LocationForm
              onSubmit={handleSubmit}
              onCoordsChange={setCoords}
              loading={loading}
            />
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Sua localização</h3>
              </div>
              {coords ? (
                <MiniMap lat={coords.lat} lng={coords.lng} />
              ) : (
                <div className="h-[280px] rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 flex items-center justify-center text-center p-6">
                  <div>
                    <MapPin className="w-8 h-8 text-cyan-500/40 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">
                      O mapa aparecerá aqui após você inserir seu endereço.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1.5" />
                <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
                  Sem compromisso
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Voce ve o resultado sem cadastrar
                </p>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <Zap className="w-4 h-4 text-cyan-400 mb-1.5" />
                <p className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold">
                  30s de busca
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Algoritmo em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
