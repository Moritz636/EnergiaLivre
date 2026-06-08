'use client'

// ============================================================
// Simulador — Calculadora interativa de ganhos do parceiro
// (usa comissões REAIS do backend via props).
// ============================================================

import { useState } from 'react'
import { Calculator, ArrowRight, MessageCircle } from 'lucide-react'
import { formatBRL } from '../_utils/format'

export interface Comissoes {
  signup: number
  recurring: number
  embaixador: number
  ufv: number
}

interface SimuladorProps {
  comissoes: Comissoes
  comissoesLoaded: boolean
  whatsappGroupUrl: string
}

export function Simulador({ comissoes, comissoesLoaded, whatsappGroupUrl }: SimuladorProps) {
  const [clientes, setClientes] = useState(10)
  const [ticketMedio, setTicketMedio] = useState(400)

  const comissaoPorClienteMes1 = (ticketMedio * comissoes.signup) / 100
  const comissaoPorClienteRecorrente = (ticketMedio * comissoes.recurring) / 100
  const totalMes1 = clientes * comissaoPorClienteMes1
  const totalRecorrente = clientes * comissaoPorClienteRecorrente
  const total12Meses = totalMes1 + totalRecorrente * 12

  return (
    <section
      id="simulador"
      className="py-20 px-6 border-t border-white/5 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-3 text-xs text-cyan-300 uppercase tracking-widest font-bold">
          <Calculator className="w-3.5 h-3.5" /> Simulador
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
          Quanto você pode ganhar.
        </h2>
        <p className="text-slate-400 text-base mb-10 max-w-2xl">
          Cálculo baseado nos{' '}
          <strong className="text-white">percentuais reais do programa</strong>
          {comissoesLoaded && (
            <span className="text-emerald-300">
              {' '}
              · {comissoes.signup}% cadastro + {comissoes.recurring}% recorrente
            </span>
          )}
          .
        </p>

        <div className="p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <RangeField
              label="Clientes indicados / mês"
              value={clientes}
              onChange={setClientes}
              min={1}
              max={50}
              step={1}
              ticks={[1, 10, 25, 40, 50]}
              format={(v) => String(v)}
            />
            <RangeField
              label="Ticket médio (R$)"
              value={ticketMedio}
              onChange={setTicketMedio}
              min={200}
              max={800}
              step={50}
              ticks={[200, 400, 600, 800]}
              format={(v) => `R$ ${v}`}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <ResultCard
              label="1º Mês"
              value={`R$ ${formatBRL(totalMes1)}`}
              hint={`${comissoes.signup}% × ${clientes} clientes × R$ ${ticketMedio}`}
              tone="emerald"
            />
            <ResultCard
              label="Recorrente / mês"
              value={`R$ ${formatBRL(totalRecorrente)}`}
              hint={`${comissoes.recurring}% × ${clientes} × R$ ${ticketMedio}`}
              tone="cyan"
            />
            <ResultCard
              label="Projeção 12 meses"
              value={`R$ ${formatBRL(total12Meses)}`}
              hint="mês 1 + recorrente × 12"
              tone="gradient"
            />
          </div>

          <p className="text-[10px] text-slate-500 mt-4 italic">
            * Simulação ilustrativa. Os valores reais dependem de quantos clientes indicados
            efetivam a contratação e permanecem ativos. Sem promessa de rendimento fixo.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <a
              href={whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Tirar dúvidas no grupo
            </a>
            <a
              href="#cadastro"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 text-sm font-bold hover:from-emerald-400 hover:to-cyan-400 transition flex items-center justify-center gap-2"
            >
              Começar agora <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// RangeField — Slider premium com label e ticks
// ============================================================

interface RangeFieldProps {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  ticks: number[]
  format: (v: number) => string
}

function RangeField({ label, value, onChange, min, max, step, ticks, format }: RangeFieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs text-slate-400 uppercase tracking-wider">{label}</label>
        <span className="text-2xl font-black text-white">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full h-1.5 bg-slate-700 rounded-full cursor-pointer accent-emerald-500"
      />
      <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// ResultCard — Card de resultado do simulador
// ============================================================

type Tone = 'emerald' | 'cyan' | 'gradient'

const TONE_CLASSES: Record<Tone, string> = {
  emerald: 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-300',
  cyan: 'bg-cyan-500/5 border border-cyan-500/20 text-cyan-300',
  gradient:
    'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 text-white',
}

const TONE_HINT: Record<Tone, string> = {
  emerald: 'text-slate-500',
  cyan: 'text-slate-500',
  gradient: 'text-emerald-300',
}

interface ResultCardProps {
  label: string
  value: string
  hint: string
  tone: Tone
}

function ResultCard({ label, value, hint, tone }: ResultCardProps) {
  return (
    <div className={`p-5 rounded-xl ${TONE_CLASSES[tone]}`}>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-black">{value}</p>
      <p className={`text-[11px] mt-1 ${TONE_HINT[tone]}`}>{hint}</p>
    </div>
  )
}
