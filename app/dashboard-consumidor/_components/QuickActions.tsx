'use client'

// ============================================================
// QuickActions — 2 cards grandes: Escanear fatura + Recarga
// ============================================================

import Link from 'next/link'
import { Camera, ScanLine, ArrowRight } from 'lucide-react'

const ACTIONS = [
  {
    href: '/dashboard/faturas/scan',
    gradient: 'from-emerald-500/15 to-cyan-500/10 border-emerald-500/30 hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-300',
    arrowColor: 'text-emerald-400',
    icon: Camera,
    title: 'Escanear fatura',
    desc: 'Use a câmera para cadastrar pelo QR Code ou código de barras',
  },
  {
    href: '/recargas',
    gradient: 'from-cyan-500/15 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/50',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-300',
    arrowColor: 'text-cyan-400',
    icon: ScanLine,
    title: 'Recarga de celular',
    desc: 'Pague com PIX ou saldo da plataforma, cashback em KWATT',
  },
] as const

export function QuickActions() {
  return (
    <div className="grid md:grid-cols-2 gap-3 mb-6">
      {ACTIONS.map((a) => {
        const Icon = a.icon
        return (
          <Link
            key={a.href}
            href={a.href}
            className={`group p-4 rounded-2xl bg-gradient-to-r ${a.gradient} border transition flex items-center gap-3`}
          >
            <div
              className={`w-12 h-12 rounded-xl ${a.iconBg} flex items-center justify-center group-hover:scale-110 transition`}
            >
              <Icon className={`w-6 h-6 ${a.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white">{a.title}</p>
              <p className="text-xs text-slate-400">{a.desc}</p>
            </div>
            <ArrowRight className={`w-5 h-5 ${a.arrowColor} group-hover:translate-x-1 transition`} />
          </Link>
        )
      })}
    </div>
  )
}
