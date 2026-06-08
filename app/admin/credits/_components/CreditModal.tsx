'use client'

// ============================================================
// CreditModal — Modal de crédito/débito manual
// ============================================================

import { useEffect, useState } from 'react'
import { X, Loader2, Plus, Minus } from 'lucide-react'
import { formatBRL } from '../_utils/format'

type ActionType = 'credit' | 'debit'

interface CreditModalProps {
  open: boolean
  userId: string | null
  userName: string
  currentBalance: number
  action: ActionType
  onClose: () => void
  onSubmit: (params: {
    userId: string
    amount: number
    type: string
    description: string
  }) => Promise<void>
}

const TYPE_OPTIONS = [
  { value: 'purchase', label: 'Compra de créditos (Pix confirmado)' },
  { value: 'commission', label: 'Comissão de parceiro' },
  { value: 'refund', label: 'Estorno' },
  { value: 'admin_credit', label: 'Crédito manual' },
  { value: 'admin_debit', label: 'Débito manual' },
  { value: 'bonus', label: 'Bônus promocional' },
  { value: 'cashback', label: 'Cashback' },
]

export function CreditModal({
  open,
  userId,
  userName,
  currentBalance,
  action,
  onClose,
  onSubmit,
}: CreditModalProps) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('purchase')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setAmount('')
      setDescription('')
      setType(action === 'credit' ? 'purchase' : 'admin_debit')
      setError('')
    }
  }, [open, action])

  if (!open || !userId) return null

  const numericAmount = Number(amount.replace(',', '.'))
  const isValid = numericAmount > 0 && Number.isFinite(numericAmount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      setError('Informe um valor positivo')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit({
        userId,
        amount: action === 'credit' ? numericAmount : -numericAmount,
        type,
        description: description || (action === 'credit' ? 'Crédito manual' : 'Débito manual'),
      })
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao processar')
    } finally {
      setLoading(false)
    }
  }

  const isCredit = action === 'credit'
  const Icon = isCredit ? Plus : Minus
  const accent = isCredit ? 'emerald' : 'red'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-lg ${
                isCredit ? 'bg-emerald-500/20' : 'bg-red-500/20'
              } flex items-center justify-center`}
            >
              <Icon className={`w-4 h-4 ${isCredit ? 'text-emerald-300' : 'text-red-300'}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isCredit ? 'Creditar saldo' : 'Debitar saldo'}
              </h2>
              <p className="text-[10px] text-slate-500">
                {userName} · Saldo atual: R$ {formatBRL(currentBalance)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
              Valor (R$)
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className={`w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white outline-none ${
                isCredit
                  ? 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
                  : 'focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
              Tipo de operação
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 outline-none appearance-none"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Pagamento de R$ 50 via Pix confirmado"
              rows={2}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className={`flex-1 py-2.5 rounded-xl ${
                isCredit
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
                  : 'bg-red-500 hover:bg-red-400 text-white'
              } font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {isCredit ? 'Creditar' : 'Debitar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
