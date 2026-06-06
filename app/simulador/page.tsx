'use client'

// ============================================================
// SimuladorPage — Página /simulador (refatorada)
// ------------------------------------------------------------
// Composição premium:
//   • Header com headline, subtítulo e badge "100% gratuito".
//   • SliderControl com feedback tátil, ticks e microanimações.
//   • Grid de ResultCard (economia mensal + anual) com hover lift.
//   • ComparisonBar (termômetro visual).
//   • Bloco de selos "diferenciais" com tooltips.
//   • TransparencyBlock (cards + FAQ acordeão).
//   • CTA com glow + arrow shift no hover.
//   • LeadCaptureDrawer (drawer) ao clicar no CTA.
//
// Toda a integração com saveLead e splitCidadeEstado está
// preservada no LeadCaptureDrawer.
// ============================================================

import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Mail,
  Sparkles,
  TrendingDown,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import SliderControl from './_components/SliderControl'
import ResultCard from './_components/ResultCard'
import ComparisonBar from './_components/ComparisonBar'
import TransparencyBlock from './_components/TransparencyBlock'
import DiferencialBadge from './_components/DiferencialBadge'
import LeadCaptureDrawer from './_components/LeadCaptureDrawer'
import SendProposalModal from './_components/SendProposalModal'
import Stagger from './_components/Stagger'
import EnergyBackground from './_components/EnergyBackground'
import { formatBRL } from './_utils/format'

// Constantes da economia — preservadas do projeto original
const PERCENTUAL_ECONOMIA = 0.32
const VALOR_INICIAL = 350

export default function SimuladorPage() {
  const [gasto, setGasto] = useState<number>(VALOR_INICIAL)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // SSR-safe: garante que a primeira pintura já tenha o valor correto
  useEffect(() => {
    setMounted(true)
  }, [])

  const economiaMensal = Math.round(gasto * PERCENTUAL_ECONOMIA)
  const economiaAnual = economiaMensal * 12
  const contaComEnergiaLivre = Math.max(0, gasto - economiaMensal)
  const reducaoPct = Math.round(PERCENTUAL_ECONOMIA * 100)

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-200 flex flex-col">
      <EnergyBackground />
      <SiteHeader />

      <main className="relative flex-1 pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* ==========================================================
              HEADER — Headline + subtítulo + badge de gratuidade
              ========================================================== */}
          <Stagger className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-5 animate-fade-up">
              <Zap className="w-3 h-3" fill="currentColor" />
              Simulação 100% gratuita • Sem cadastro
            </div>

            <h1 className="animate-fade-up text-balance text-3xl sm:text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
              Quanto você pode{' '}
              <span className="relative inline-block">
                <span className="text-gradient-emerald">economizar?</span>
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
                />
              </span>
            </h1>

            <p className="animate-fade-up mt-4 sm:mt-5 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto text-balance">
              Ajuste o valor da sua conta de luz e veja a economia em tempo
              real — sem cadastro, sem letras miúdas.
            </p>
          </Stagger>

          {/* ==========================================================
              CARD PRINCIPAL — Slider + Resultados
              ========================================================== */}
          <div className="animate-fade-up border-gradient-soft bg-glass rounded-3xl p-5 sm:p-8 md:p-12 shadow-2xl shadow-black/40">
            <SliderControl value={gasto} onChange={setGasto} />

            {/* Resultados (cards premium) */}
            <div className="mt-8 sm:mt-10 grid sm:grid-cols-2 gap-4 sm:gap-5">
              <ResultCard
                label="Economia mensal"
                value={`R$ ${formatBRL(economiaMensal)}`}
                caption={
                  <>
                    até <strong className="text-emerald-300">{reducaoPct}%</strong> de
                    desconto na sua fatura
                  </>
                }
                icon={TrendingDown}
                variant="primary"
              />
              <ResultCard
                label="Economia em 12 meses"
                value={`R$ ${formatBRL(economiaAnual)}`}
                caption={
                  <>
                    equivalente a ≈{' '}
                    <strong className="text-white">
                      {Math.round(economiaAnual / 100)} meses grátis
                    </strong>
                  </>
                }
                icon={Wallet}
                variant="neutral"
              />
            </div>

            {/* Termômetro comparativo */}
            <div className="mt-6">
              <ComparisonBar
                gasto={gasto}
                contaComEnergiaLivre={contaComEnergiaLivre}
              />
            </div>

            {/* ==========================================================
                DIFERENCIAIS — Selos com tooltip
                ========================================================== */}
            <div className="mt-8 sm:mt-10">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold text-center mb-3">
                Por que escolher a EnergiaLivre
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                <DiferencialBadge
                  icon={CreditCard}
                  label="Sem investimento"
                  tooltip="Você não paga nada pela instalação. A energia vem de usinas parceiras já construídas."
                />
                <DiferencialBadge
                  icon={Wrench}
                  label="Sem obras"
                  tooltip="Nenhuma instalação na sua casa. Sem técnicos, sem perfuração, sem barulho."
                />
                <DiferencialBadge
                  icon={BadgeCheck}
                  label="100% digital"
                  tooltip="Cadastro, contrato e suporte acontecem pelo celular. Você só precisa da fatura em mãos."
                />
                <DiferencialBadge
                  icon={CheckCircle2}
                  label="Regulado ANEEL"
                  tooltip="Toda a operação é fiscalizada pela Agência Nacional de Energia Elétrica. Seu contrato é protegido pelo CDC."
                />
              </div>
            </div>

            {/* ==========================================================
                CTA — "Quero economizar agora" (premium)
                ========================================================== */}
            <div className="mt-8 sm:mt-10 space-y-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="group relative w-full overflow-hidden rounded-2xl py-4 sm:py-5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black text-base sm:text-lg transition-all duration-300 shadow-glow-emerald hover:shadow-glow-emerald-lg hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-emerald-300 animate-pulse-glow"
              >
                {/* Brilho que varre o botão no hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                  }}
                />
                <span className="relative flex items-center justify-center gap-2 sm:gap-3">
                  Quero economizar agora
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </button>

              <p className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3 h-3" />
                Resposta em até 24h • Sem compromisso
              </p>

              {/* CTA secundário — Enviar PDF por e-mail */}
              <button
                type="button"
                onClick={() => setPdfOpen(true)}
                className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-300 hover:text-cyan-200 font-bold text-sm transition-all"
              >
                <FileText className="w-4 h-4 transition-transform group-hover:scale-110" />
                Enviar PDF da proposta por e-mail
                <Mail className="w-3.5 h-3.5 opacity-60" />
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-200">
                  48h
                </span>
              </button>
            </div>
          </div>

          {/* ==========================================================
              TRANSPARÊNCIA + FAQ — Bloco competitivo
              ========================================================== */}
          <div className="mt-10 sm:mt-12 animate-fade-up">
            <TransparencyBlock gasto={gasto} />
          </div>

          {/* ==========================================================
              COMPARATIVO SUTIL — Diferencial contra concorrentes
              ========================================================== */}
          <div className="mt-10 sm:mt-12 grid sm:grid-cols-2 gap-3 sm:gap-4 text-xs animate-fade-up">
            <Pill
              icon={Sparkles}
              title="Tempo real"
              text="Outros enviam PDF por e-mail. Você simula aqui, agora."
            />
            <Pill
              icon={CheckCircle2}
              title="Transparência total"
              text="Outros escondem o prazo. A gente te conta antes de você assinar."
            />
          </div>
        </div>
      </main>

      <SiteFooter />

      {/* Drawer de captura (lazy) */}
      {mounted && (
        <LeadCaptureDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          gasto={gasto}
          economiaMensal={economiaMensal}
        />
      )}

      {/* Modal "Enviar PDF por e-mail" (lazy) */}
      {mounted && (
        <SendProposalModal
          open={pdfOpen}
          onClose={() => setPdfOpen(false)}
          gasto={gasto}
          economiaMensal={economiaMensal}
        />
      )}
    </div>
  )
}

// ============================================================
// Subcomponente local: Pill comparativo
// ============================================================

interface PillProps {
  icon: typeof Sparkles
  title: string
  text: string
}

function Pill({ icon: Icon, title, text }: PillProps) {
  return (
    <div className="group flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 transition-colors hover:bg-white/[0.04] hover:border-emerald-500/20">
      <div className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center transition-transform group-hover:scale-110">
        <Icon className="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <p className="font-bold text-slate-200 mb-0.5">{title}</p>
        <p className="text-slate-500 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
