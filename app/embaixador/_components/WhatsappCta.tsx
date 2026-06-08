'use client'

// ============================================================
// WhatsappCta — CTA final para entrar no grupo de parceiros.
// ============================================================

import { MessageCircle } from 'lucide-react'

interface WhatsappCtaProps {
  whatsappGroupUrl: string
}

export function WhatsappCta({ whatsappGroupUrl }: WhatsappCtaProps) {
  return (
    <section className="py-20 px-6 border-t border-white/5 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500/20 items-center justify-center mb-6"
          aria-hidden
        >
          <MessageCircle className="w-8 h-8 text-emerald-300" />
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
          Entre no grupo de parceiros.
        </h2>
        <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
Network com outros parceiros, tire dúvidas em tempo real, receba materiais
           exclusivos e fique por dentro das novidades do programa.
        </p>
        <a
          href={whatsappGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold hover:from-emerald-400 hover:to-cyan-400 transition"
        >
          <MessageCircle className="w-4 h-4" /> Entrar no grupo agora
        </a>
        <p className="text-[10px] text-slate-500 mt-3">
          Grupo oficial · ~100 parceiros ativos · Moderação diária
        </p>
      </div>
    </section>
  )
}
