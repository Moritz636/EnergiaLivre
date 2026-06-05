'use client'

import Link from 'next/link'
import { Crown, X, Sparkles } from 'lucide-react'
import { useState } from 'react'

const DISMISS_KEY = 'mp-banner-dismissed-at'
const DISMISS_DAYS = 7

export default function MemberPlusBanner() {
  const [dismissed, setDismissed] = useState(false)

  // Check sessionStorage on client
  if (typeof window !== 'undefined' && !dismissed) {
    const last = sessionStorage.getItem(DISMISS_KEY)
    if (last) {
      const days = (Date.now() - Number(last)) / (1000 * 60 * 60 * 24)
      if (days < DISMISS_DAYS) {
        if (!dismissed) setDismissed(true)
      }
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DISMISS_KEY, String(Date.now()))
    }
  }

  if (dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 flex-wrap">
        <Crown className="w-4 h-4 text-slate-900 shrink-0" />
        <p className="text-xs sm:text-sm font-bold flex-1 min-w-0 truncate">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Member Plus — Match ilimitado + propostas + análise de fatura por apenas <strong>R$ 9,90/mês</strong>
        </p>
        <Link
          href="/checkout-member-plus"
          className="px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-yellow-300 text-xs font-extrabold transition shrink-0"
        >
          Assinar agora
        </Link>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-slate-900/20 transition shrink-0"
          aria-label="Fechar banner"
        >
          <X className="w-3.5 h-3.5 text-slate-900" />
        </button>
      </div>
    </div>
  )
}
