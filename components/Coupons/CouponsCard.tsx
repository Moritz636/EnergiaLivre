'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, Share2, MessageCircle, Ticket } from 'lucide-react'
import { getSupabase } from '@/lib/supabase/singleton'
import {
  listMyCoupons,
  getMyReferralCode,
  buildShareLink,
  buildWhatsAppShareText,
  type CouponWithStatus,
} from '@/lib/coupons'
import { useAuth } from '@/app/hooks/useAuth'

export default function CouponsCard() {
  const { user } = useAuth()
  const supabase = getSupabase()
  const [coupons, setCoupons] = useState<CouponWithStatus[]>([])
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let mounted = true
    async function load() {
      try {
        const [list, code] = await Promise.all([
          listMyCoupons(supabase, user.id),
          getMyReferralCode(supabase, user.id),
        ])
        if (!mounted) return
        setCoupons(list)
        setReferralCode(code)
      } catch {
        // ok
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleCopy = async (text: string, code: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      // fallback
    }
  }

  const handleShare = (code: string) => {
    const shareLink = buildShareLink(code)
    const text = buildWhatsAppShareText(code, shareLink)
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-slate-500 text-sm">Carregando cupons...</p>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Ticket className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Seus cupons de convite</h3>
      </div>
      <p className="text-xs text-slate-400 mb-3">
        Cada amigo cadastrado com seu cupom = +20 moedas pra você e +20 pra eles.
        Moedas valem para desconto em faturas.
      </p>

      {coupons.length === 0 ? (
        <p className="text-xs text-slate-500">
          Seus cupons serão gerados automaticamente.
        </p>
      ) : (
        <ul className="space-y-2">
          {coupons.map((c) => {
            const shareLink = buildShareLink(c.code)
            return (
              <li
                key={c.id}
                className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                  c.is_used
                    ? 'bg-slate-800/50 border-slate-700/50 opacity-60'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono font-bold text-white tracking-wider truncate">
                    {c.code}
                  </p>
                  {c.is_used ? (
                    <p className="text-[10px] text-slate-500">
                      Usado em {c.used_at ? new Date(c.used_at).toLocaleDateString('pt-BR') : ''}
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-300">Disponível • +{c.bonus_coins} moedas cada</p>
                  )}
                </div>
                {!c.is_used && (
                  <>
                    <button
                      onClick={() => handleCopy(shareLink, c.code)}
                      className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition"
                      aria-label="Copiar link"
                      title="Copiar link"
                    >
                      {copiedCode === c.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </button>
                    <button
                      onClick={() => handleShare(c.code)}
                      className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 transition"
                      aria-label="Compartilhar no WhatsApp"
                      title="Compartilhar no WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
                    </button>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {referralCode && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-[10px] text-slate-500 mb-1">Seu código de indicação pessoal</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-2 py-1 rounded bg-black/30 text-xs font-mono text-emerald-300 truncate">
              {referralCode}
            </code>
            <button
              onClick={() => handleCopy(buildShareLink(referralCode), referralCode)}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition"
              aria-label="Copiar código"
            >
              {copiedCode === referralCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-300" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
