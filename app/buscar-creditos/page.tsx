'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, Zap, Search, AlertTriangle, Users, ArrowLeft } from 'lucide-react'

const MOCK_POINTS = [
  { id: 1, lat: -23.5505, lng: -46.6333, nome: 'Condomínio Solar', excedente: 320, distancia: '1.2 km', preco: 'R$ 0,68/kWh' },
  { id: 2, lat: -23.5615, lng: -46.6564, nome: 'Usina Urbana ZS', excedente: 180, distancia: '2.5 km', preco: 'R$ 0,72/kWh' },
  { id: 3, lat: -23.5405, lng: -46.6133, nome: 'Edifício Green', excedente: 450, distancia: '3.0 km', preco: 'R$ 0,65/kWh' },
  { id: 4, lat: -23.5565, lng: -46.6733, nome: 'Casa Solara', excedente: 95, distancia: '0.8 km', preco: 'R$ 0,70/kWh' },
  { id: 5, lat: -23.5305, lng: -46.6933, nome: 'Fazenda Luz', excedente: 680, distancia: '4.1 km', preco: 'R$ 0,62/kWh' },
]

const MapView = dynamic(() => import('@/components/LeafletMap'), { ssr: false })

export default function BuscarCreditosPage() {
  const [cep, setCep] = useState('')
  const [buscaAtiva, setBuscaAtiva] = useState(false)

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-emerald-400 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
            <MapPin className="w-3 h-3" /> Conexão Local
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Encontre créditos de energia perto de você
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Pessoas e empresas com excedente solar na sua região. Economize sem instalar placas.
          </p>
        </div>

        <div className="flex items-center gap-3 max-w-md mx-auto mb-10">
          <input
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            placeholder="Digite seu CEP"
            maxLength={9}
            className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition"
          />
          <button
            onClick={() => setBuscaAtiva(true)}
            disabled={!cep.trim()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 rounded-xl font-bold transition flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> Buscar
          </button>
        </div>

        {buscaAtiva && (
          <>
            <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-white/10 mb-8">
              <MapView points={MOCK_POINTS} />
            </div>

            <div className="space-y-3 mb-10">
              {MOCK_POINTS.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{p.nome}</p>
                    <p className="text-xs text-slate-400">{p.excedente} kWh/mês disponível a {p.preco}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-black">{p.distancia}</p>
                    <button className="text-[10px] text-emerald-500 hover:text-emerald-400 underline">Solicitar conexão</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-slate-400 leading-relaxed">
              <strong className="text-yellow-300 flex items-center gap-1 mb-1"><AlertTriangle className="w-3 h-3" /> Importante</strong>
              Os créditos de energia são cedidos via <strong>doação com contrapartida em Pix</strong>, conforme Resolução ANEEL 1.059/2023.
              A EnergiaLivre facilita a conexão entre as partes. Consulte os termos legais em /regulamentacao.
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
              <Users className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300">Tem excedente solar?</strong>
                {' '}Cadastre-se como gerador e apareça no mapa gratuitamente.{' '}
                <Link href="/cadastro-gerador" className="text-emerald-400 underline">Quero disponibilizar</Link>
              </div>
            </div>
          </>
        )}

        {!buscaAtiva && (
          <div className="text-center py-16 text-slate-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Insira um CEP para ver os pontos de excedente disponíveis na sua região.</p>
          </div>
        )}
      </div>
    </div>
  )
}
