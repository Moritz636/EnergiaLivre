'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { WHATSAPP_BASE } from '@/lib/leads'

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const CONCESSIONARIAS = [
  'Enel', 'Equatorial', 'Cemig', 'Copel', 'Celesc', 'CPFL', 'Eletrobras',
  'Light', 'Neoenergia', 'Eletropaulo', 'Coelba', 'Celpe', 'Cosern',
  'RGE', 'CEEE', 'AES Sul', 'EDP', 'Elektro', 'Sulgás', 'Outra',
]

export default function InvoiceUpload() {
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [consumo, setConsumo] = useState('')
  const [distribuidora, setDistribuidora] = useState('')
  const [estado, setEstado] = useState('')
  const [outraDistribuidora, setOutraDistribuidora] = useState('')
  const [valor, setValor] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !whatsapp || !consumo || !estado) return

    const dist = distribuidora === 'Outra' ? outraDistribuidora : distribuidora
    const msg = [
      `*Nova fatura — EnergiaLivre*`,
      ``,
      `👤 *Nome:* ${nome}`,
      `📱 *WhatsApp:* ${whatsapp}`,
      `⚡ *Consumo:* ${consumo} kWh/mês`,
      `🏢 *Distribuidora:* ${dist}`,
      `📍 *Estado:* ${estado}`,
      valor ? `💰 *Valor:* R$ ${valor}` : null,
      vencimento ? `📅 *Vencimento:* ${vencimento}` : null,
      ``,
      `_Enviado via app EnergiaLivre_`,
    ].filter(Boolean).join('\n')

    setSending(true)
    const url = `${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    setSent(true)
    setSending(false)
  }

  if (sent) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <p className="text-lg font-bold text-white mb-2">Fatura enviada!</p>
        <p className="text-sm text-slate-400 mb-6">
          Nossa equipe vai analisar os dados e entrará em contato pelo WhatsApp em até 24h úteis.
        </p>
        <button
          onClick={() => { setSent(false); setNome(''); setWhatsapp(''); setConsumo(''); setDistribuidora(''); setEstado(''); setOutraDistribuidora(''); setValor(''); setVencimento('') }}
          className="px-6 py-2 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition"
        >
          Enviar outra fatura
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs text-slate-400 mb-1">Nome completo *</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">WhatsApp *</label>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="(84) 99999-8888"
          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Consumo (kWh/mês) *</label>
          <input
            type="number"
            value={consumo}
            onChange={(e) => setConsumo(e.target.value)}
            placeholder="300"
            min="1"
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Estado (UF) *</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            required
          >
            <option value="">UF</option>
            {UF_LIST.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Distribuidora</label>
        <select
          value={distribuidora}
          onChange={(e) => setDistribuidora(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50"
        >
          <option value="">Selecione</option>
          {CONCESSIONARIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {distribuidora === 'Outra' && (
          <input
            type="text"
            value={outraDistribuidora}
            onChange={(e) => setOutraDistribuidora(e.target.value)}
            placeholder="Qual distribuidora?"
            className="w-full mt-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Valor (R$)</label>
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="189,90"
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Vencimento</label>
          <input
            type="text"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
            placeholder="15/07/2026"
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!nome || !whatsapp || !consumo || !estado || sending}
        className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {sending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
        ) : (
          <><Send className="w-4 h-4" /> Enviar fatura via WhatsApp</>
        )}
      </button>

      <p className="text-[10px] text-slate-500 text-center leading-relaxed">
        Sua fatura será enviada para nossa equipe técnica analisar. 
        Entraremos em contato pelo WhatsApp em até 24h úteis com uma proposta personalizada.
      </p>
    </form>
  )
}