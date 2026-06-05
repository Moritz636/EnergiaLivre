'use client'

// ============================================
// CONSENT MODAL — MODAL BLOQUEANTE DO ACORDO
// ============================================
// Aparece no 1o login (e quando last_terms_version !== current).
// Bloqueia o dashboard ate aceitar.
// Usado em: 3 dashboards (consumidor, gerador, embaixador)
// ============================================

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Scale, X, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { CURRENT_TERMS_VERSION, CURRENT_TERMS_HASH } from '@/lib/commissions'

interface ConsentModalProps {
  open: boolean
  onAccepted: () => void
  termsVersion?: string
}

export function ConsentModal({ open, onAccepted, termsVersion = CURRENT_TERMS_VERSION }: ConsentModalProps) {
  const [loading, setLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setAccepted(false)
      setScrolled(false)
      setError(null)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      setScrolled(true)
    }
  }

  async function handleAccept() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accept: true,
          termsVersion,
          termsHash: CURRENT_TERMS_HASH,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error ?? 'Erro ao registrar acordo')
      }
      onAccepted()
    } catch (err: any) {
      setError(err?.message ?? 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!confirm('Sem aceitar o acordo, você não pode usar a plataforma. Deseja sair?')) return
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient()
      await supabase.auth.signOut()
    } catch {}
    window.location.href = '/'
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-emerald-500/20">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 id="consent-title" className="text-lg font-bold text-slate-100">
                Acordo de Pagamento e Uso
              </h2>
              <p className="text-xs text-slate-400 font-mono">{termsVersion}</p>
            </div>
          </div>
        </div>

        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-300 leading-relaxed"
        >
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-200 text-xs">
              Para usar a plataforma, você precisa ler e aceitar o acordo abaixo.
              Ele é obrigatório por lei (LGPD + CDC) e formaliza o modelo econômico, comissões e responsabilidades.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-emerald-300 mb-1">Resumo rápido</h3>
            <ul className="space-y-1 list-disc list-inside text-slate-400 text-xs">
              <li>Consumidor não paga nada (Member Plus opcional R$ 9,90/mês);</li>
              <li>Moedas são <strong>desconto</strong> em fatura (não pagamento direto);</li>
              <li>Embaixador recebe 5% dos clientes da rede + 20 moedas por match;</li>
              <li>Gerador (UFV) paga 15% de taxa por conexão ativa;</li>
              <li>Match aceito → 20 moedas para cada parte + 20 ao embaixador;</li>
              <li>Dados protegidos pela LGPD (Lei 13.709/2018).</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-emerald-300 mb-1">Versão completa</h3>
            <p className="text-slate-400 text-xs">
              O texto completo está em{' '}
              <Link href="/termos" target="_blank" className="text-emerald-400 hover:underline">
                /termos
              </Link>
              . Leia com atenção antes de aceitar. Você pode revogar o consentimento a qualquer
              momento via <a href="mailto:fiscaltecnico.qualidade@gmail.com" className="text-emerald-400 hover:underline">
              fiscaltecnico.qualidade@gmail.com</a>.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-emerald-300 mb-1">Comissões automáticas</h3>
            <p className="text-slate-400 text-xs">
              Ao aceitar, você concorda com o processamento automático de comissões:
            </p>
            <ul className="space-y-1 list-disc list-inside text-slate-400 text-xs mt-1">
              <li>Match aceito → 20 moedas para você + 20 para a contraparte + 20 ao embaixador (se houver);</li>
              <li>Pagamento confirmado → 5% ao embaixador (se houver) + 15% ao gerador (se você for consumidor com match ativo).</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-xs text-slate-500 font-mono break-all">
            Hash do documento: {CURRENT_TERMS_HASH}
          </div>

          {!scrolled && (
            <p className="text-center text-amber-400 text-xs animate-pulse">
              Role até o final para habilitar o botão &laquo;Aceitar&raquo;
            </p>
          )}
        </div>

        <div className="border-t border-slate-800 p-6 space-y-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={!scrolled}
              className="mt-1 w-4 h-4 accent-emerald-500 disabled:opacity-50"
            />
            <span className={`text-xs ${scrolled ? 'text-slate-300' : 'text-slate-600'}`}>
              Li e aceito o <Link href="/termos" target="_blank" className="text-emerald-400 hover:underline">Acordo de Pagamento e Uso</Link> versão {termsVersion},
              incluindo o modelo de comissões e o tratamento de dados (LGPD).
            </span>
          </label>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              Recusar e sair
            </button>
            <button
              onClick={handleAccept}
              disabled={!accepted || !scrolled || loading}
              className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Aceitar e continuar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
