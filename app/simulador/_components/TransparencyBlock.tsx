'use client'

// ============================================================
// TransparencyBlock — Bloco de transparência + FAQ interativo
// ------------------------------------------------------------
// - 2 cards: "Prazo regulatório (90 dias)" e "Regulado ANEEL".
// - Acordeão de FAQ com 3 perguntas comuns (educa sem sair da página).
// - Tooltip "?" nos termos-chave.
// ============================================================

import { useState } from 'react'
import { ChevronDown, Clock, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react'
import Tooltip from './Tooltip'

interface FaqItem {
  q: string
  a: string
  term?: { label: string; tip: string }
}

const FAQS: FaqItem[] = [
  {
    q: 'Por que a economia demora até 90 dias para começar?',
    a: 'É o prazo regulatório da ANEEL para a distribuidora homologar a troca de titularidade dos créditos de energia. Esse é o teto legal — a média real é de 45 a 60 dias. Você fica cadastrado e pré-aprovado desde o dia 1.',
    term: {
      label: 'prazo regulatório',
      tip: 'Janela máxima definida pela ANEEL para que a distribuidora processe a migração para créditos de energia solar.',
    },
  },
  {
    q: 'O que significa "regulado pela ANEEL"?',
    a: 'Toda a operação da EnergiaLivre é auditada pela Agência Nacional de Energia Elétrica. Os créditos de energia que você recebe vêm de usinas regularizadas e seu contrato é protegido pelo Código de Defesa do Consumidor.',
    term: {
      label: 'regulado ANEEL',
      tip: 'A ANEEL (Agência Nacional de Energia Elétrica) é o órgão federal que regula geração, transmissão e distribuição de energia no Brasil.',
    },
  },
  {
    q: 'Como funciona o "100% digital"?',
    a: 'Cadastro, assinatura, troca de titularidade e suporte acontecem 100% online. Sem visita técnica, sem obras, sem instalação de equipamentos na sua casa. Você só precisa da fatura em mãos.',
    term: {
      label: '100% digital',
      tip: 'Todo o processo é feito pelo celular ou computador — sem técnicos, sem obras, sem instalação.',
    },
  },
]

interface TransparencyBlockProps {
  gasto: number
}

export default function TransparencyBlock({ gasto }: TransparencyBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* CARD 1 — Prazo regulatório */}
      <article className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] to-amber-600/[0.02] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-[0_0_30px_-8px_rgba(245,158,11,0.5)]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-200">
              Prazo regulatório: até 90 dias
            </h4>
            <p className="text-[11px] text-amber-400/70 mt-0.5">
              Enquanto isso, sua vaga já está garantida
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          A economia começa a valer em até{' '}
          <strong className="text-amber-300">90 dias</strong> — é o prazo legal
          que a distribuidora tem para homologar a troca de titularidade dos
          créditos. Na prática, a média é de <strong>45 a 60 dias</strong>.
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-300/80 font-medium">
          <Sparkles className="w-3 h-3" />
          <span>
            Sua simulação de{' '}
            <strong>R$ {gasto.toLocaleString('pt-BR')}/mês</strong> já está
            pré-aprovada
          </span>
        </div>
      </article>

      {/* CARD 2 — Regulado ANEEL */}
      <article className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.07] to-emerald-600/[0.02] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-[0_0_30px_-8px_rgba(16,185,129,0.5)]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-200">
              Regulado pela ANEEL
            </h4>
            <p className="text-[11px] text-emerald-400/70 mt-0.5">
              Contrato auditado e protegido
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          A operação é fiscalizada pela{' '}
          <strong className="text-emerald-300">Agência Nacional de Energia
          Elétrica</strong>. Os créditos vêm de usinas regularizadas e seu
          contrato é blindado pelo Código de Defesa do Consumidor.
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-300/80 font-medium">
          <ShieldCheck className="w-3 h-3" />
          <span>Lei 14.300/2022 · REN 687/2015 · LGPD</span>
        </div>
      </article>

      {/* FAQ Acordeão (full width) */}
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
            Perguntas frequentes
          </h4>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors group"
                >
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                <div
                  id={`faq-panel-${i}`}
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-xs text-slate-400 leading-relaxed">
                      {faq.term ? (
                        <>
                          {faq.a.split(faq.term.label).map((part, idx, arr) => (
                            <span key={idx}>
                              {part}
                              {idx < arr.length - 1 && (
                                <Tooltip content={faq.term!.tip}>
                                  <span className="inline-flex items-center gap-0.5 text-cyan-300 border-b border-dashed border-cyan-400/40 cursor-help">
                                    {faq.term!.label}
                                    <HelpCircle className="w-3 h-3" />
                                  </span>
                                </Tooltip>
                              )}
                            </span>
                          ))}
                        </>
                      ) : (
                        faq.a
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
