'use client'

// ============================================================
// CreditWallet — Card de saldo + extrato + ação de comprar
// ============================================================

import { useState } from 'react'
import { Wallet, Plus, ArrowDownRight, ArrowUpRight, Loader2, Clock } from 'lucide-react'
import { useCredits } from './useCredits'
import { PaymentInstructions } from './PaymentInstructions'

const TYPE_LABELS: Record<string, { label: string; positive: boolean }> = {
  purchase: { label: 'Compra de créditos', positive: true },
  commission: { label: 'Comissão', positive: true },
  refund: { label: 'Estorno', positive: true },
  admin_credit: { label: 'Crédito', positive: true },
  admin_debit: { label: 'Débito', positive: false },
  payment: { label: 'Pagamento', positive: false },
  transfer_in: { label: 'Transferência recebida', positive: true },
  transfer_out: { label: 'Transferência enviada', positive: false },
  bonus: { label: 'Bônus', positive: true },
  cashback: { label: 'Cashback', positive: true },
}

const PRESET_AMOUNTS = [50, 100, 250, 500]

interface CreditWalletProps {
  userId: string
  variant?: 'default' | 'compact'
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function CreditWallet({ userId, variant = 'default' }: CreditWalletProps) {
  const { balance, loading, error, transactions, refresh } = useCredits(userId)
  const [paying, setPaying] = useState(false)
  const [payAmount, setPayAmount] = useState<number | null>(null)
  const [requested, setRequested] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const handleConfirmPay = async () => {
    if (!payAmount) return
    setPayError(null)
    setPaying(true)
    try {
      const res = await fetch('/api/user/credits/purchase-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payAmount }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Falha ao registrar solicitação')
      }
      setPayAmount(null)
      setRequested(true)
      setTimeout(() => setRequested(false), 6000)
      await refresh()
    } catch (err: any) {
      setPayError(err?.message ?? 'Erro ao processar')
    } finally {
      setPaying(false)
    }
  }

  if (variant === 'compact') {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
              Saldo
            </span>
          </div>
          {loading && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
        </div>
        <p className="text-2xl font-black text-white">
          R$ {formatBRL(balance)}
        </p>
        <button
          onClick={() => setPayAmount(PRESET_AMOUNTS[0])}
          className="mt-3 w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3" /> Comprar créditos
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Carteira de créditos</h3>
              <p className="text-[10px] text-slate-500">
                Use para pagar propostas, comissões e serviços
              </p>
            </div>
          </div>
          {loading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
        </div>

        <div className="p-5">
          <div className="text-center py-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              Saldo disponível
            </p>
            <p className="text-4xl font-black text-white">
              R$ <span className="text-emerald-400">{formatBRL(balance)}</span>
            </p>
            {error && (
              <p className="text-[10px] text-red-400 mt-2">{error}</p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESET_AMOUNTS.map((v) => (
              <button
                key={v}
                onClick={() => setPayAmount(v)}
                className="py-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 text-sm font-bold text-white transition"
              >
                R$ {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPayAmount(balance === 0 ? 50 : PRESET_AMOUNTS[1])}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Comprar créditos via Pix
          </button>

          {requested && (
            <p className="mt-3 text-center text-[10px] text-emerald-300">
              ✓ Solicitação registrada! Aguarde a confirmação do admin (até 24h).
            </p>
          )}
          {payError && (
            <p className="mt-3 text-center text-[10px] text-red-400">
              {payError}
            </p>
          )}
        </div>

        {transactions.length > 0 && (
          <div className="border-t border-white/10">
            <div className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Últimas movimentações
            </div>
            <ul className="divide-y divide-white/5 max-h-72 overflow-y-auto">
              {transactions.slice(0, 10).map((t) => {
                const meta = TYPE_LABELS[t.type] ?? {
                  label: t.type,
                  positive: t.amount > 0,
                }
                const positive = t.amount > 0
                const pending = t.status === 'pending'
                return (
                  <li key={t.id} className="px-5 py-2.5 flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        pending
                          ? 'bg-yellow-500/15'
                          : positive
                            ? 'bg-emerald-500/15'
                            : 'bg-red-500/15'
                      }`}
                    >
                      {pending ? (
                        <Clock className="w-3.5 h-3.5 text-yellow-400" />
                      ) : positive ? (
                        <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate flex items-center gap-1.5">
                        {meta.label}
                        {pending && (
                          <span className="text-[9px] uppercase tracking-wider text-yellow-300 font-bold">
                            · aguardando
                          </span>
                        )}
                      </p>
                      {t.description && (
                        <p className="text-[10px] text-slate-500 truncate">
                          {t.description}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-500">
                        {formatDateTime(t.created_at)}
                      </p>
                    </div>
                    <span
                      className={`font-black text-sm ${
                        pending
                          ? 'text-yellow-400'
                          : positive
                            ? 'text-emerald-400'
                            : 'text-red-400'
                      }`}
                    >
                      {positive ? '+' : ''}R$ {formatBRL(Math.abs(t.amount))}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      <PaymentInstructions
        open={payAmount !== null}
        onClose={() => setPayAmount(null)}
        amount={payAmount ?? 0}
        onConfirm={handleConfirmPay}
        confirming={paying}
      />
    </>
  )
}
