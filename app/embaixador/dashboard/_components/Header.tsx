'use client'

// ============================================================
// Header — Cabeçalho da página com título, subtítulo contextual
// e CTA primário "Simular Ganhos".
// ============================================================

import Link from 'next/link'
import { Handshake, Sparkles } from 'lucide-react'

interface HeaderProps {
  cidade?: string | null
  estado?: string | null
}

export function Header({ cidade, estado }: HeaderProps) {
  const hasBase = !!(cidade && estado)

  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Handshake className="w-6 h-6 text-yellow-400" aria-hidden />
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Painel do Parceiro
          </h1>
        </div>
        <p className="text-slate-400">
          {hasBase ? (
            <>
              Base: <span className="text-slate-200 font-medium">{cidade}/{estado}</span>
            </>
          ) : (
            'Complete seu perfil para ativar as indicações.'
          )}
        </p>
      </div>

      <Link
        href="/embaixador#simulador"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-emerald-500 text-slate-900 rounded-xl font-bold hover:brightness-110 transition shadow-lg shadow-emerald-500/20"
      >
        <Sparkles className="w-4 h-4" />
        Simular Ganhos
      </Link>
    </div>
  )
}
