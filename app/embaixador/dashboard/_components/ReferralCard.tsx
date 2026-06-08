'use client'

// ============================================================
// ReferralCard — Card de link de indicação com copy-to-clipboard
// e atalhos de compartilhamento (WhatsApp + Materiais).
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import { Share2, Copy, Check, Sparkles } from 'lucide-react'

interface ReferralCardProps {
  referralLink: string
  partnerCode?: string
}

export function ReferralCard({ referralLink, partnerCode }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const handleCopy = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard bloqueado */
    }
  }

  const handleCopyCode = async () => {
    if (!partnerCode) return
    try {
      await navigator.clipboard.writeText(partnerCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 1800)
    } catch {
      /* clipboard bloqueado */
    }
  }

  const whatsappMessage = encodeURIComponent(
    `Olha essa plataforma de energia solar: ${referralLink}${partnerCode ? `\n\nMeu código de parceiro: ${partnerCode}` : ''}`,
  )

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Share2 className="w-5 h-5 text-emerald-400" />
        Seu link de indicação
      </h3>
      <p className="text-xs text-slate-400 mb-3">
        Compartilhe este link. Cada cadastro conta como sua indicação.
      </p>

      {partnerCode && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/30">
          <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider mb-1">Seu Código de Parceiro</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-xl font-black text-white tracking-widest bg-slate-900/50 rounded-lg py-2 px-3 border border-white/10 text-center">
              {partnerCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-lg font-bold transition text-sm"
              aria-label={codeCopied ? 'Código copiado' : 'Copiar código'}
            >
              {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Use este código para indicar amigos. Eles podem inserir na hora do cadastro.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          readOnly
          value={referralLink}
          aria-label="Link de indicação"
          className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-slate-300 outline-none focus:border-emerald-500/50"
        />
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-bold transition"
          aria-label={copied ? 'Link copiado' : 'Copiar link'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <a
          href={`https://wa.me/?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition"
        >
          <Share2 className="w-4 h-4" /> WhatsApp
        </a>
        <Link
          href="/embaixador"
          className="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition"
        >
          <Sparkles className="w-4 h-4" /> Materiais
        </Link>
      </div>
    </div>
  )
}
