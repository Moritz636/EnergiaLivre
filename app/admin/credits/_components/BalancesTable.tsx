'use client'

// ============================================================
// BalancesTable — Tabela de saldos por usuário (admin)
// ============================================================

import { useState } from 'react'
import { Search, Plus, Minus, Loader2 } from 'lucide-react'
import { formatBRL, formatDateTime } from '../_utils/format'

export interface UserBalanceRow {
  user_id: string
  balance: number
  updated_at: string
  profiles: {
    id: string
    nome: string | null
    email: string | null
    tipo: string | null
    role: string | null
  } | null
}

interface BalancesTableProps {
  rows: UserBalanceRow[]
  loading: boolean
  onAction: (userId: string, nome: string, type: 'credit' | 'debit') => void
}

const TIPO_STYLES: Record<string, string> = {
  consumidor: 'bg-emerald-500/20 text-emerald-300',
  gerador: 'bg-blue-500/20 text-blue-300',
  parceiro: 'bg-yellow-500/20 text-yellow-300',
  admin: 'bg-purple-500/20 text-purple-300',
}

export function BalancesTable({ rows, loading, onAction }: BalancesTableProps) {
  const [search, setSearch] = useState('')

  const filtered = rows.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.profiles?.nome?.toLowerCase().includes(q) ||
      r.profiles?.email?.toLowerCase().includes(q) ||
      r.user_id.toLowerCase().includes(q)
    )
  })

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-white flex-1"
          />
        </div>
        <span className="text-xs text-slate-400">
          {filtered.length} de {rows.length} {rows.length === 1 ? 'usuário' : 'usuários'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Usuário</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-right p-3">Saldo</th>
              <th className="text-left p-3">Atualizado</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-400" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  {search ? 'Nenhum usuário encontrado' : 'Nenhum usuário com saldo ainda'}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.user_id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="p-3">
                    <div>
                      <p className="text-sm text-white font-medium">
                        {r.profiles?.nome || '—'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {r.profiles?.email || r.user_id}
                      </p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        TIPO_STYLES[r.profiles?.tipo ?? ''] ??
                        'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {r.profiles?.tipo || 'user'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`font-black ${
                        r.balance > 0 ? 'text-emerald-300' : 'text-slate-500'
                      }`}
                    >
                      R$ {formatBRL(r.balance)}
                    </span>
                  </td>
                  <td className="p-3 text-[10px] text-slate-400">
                    {formatDateTime(r.updated_at)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() =>
                          onAction(r.user_id, r.profiles?.nome ?? 'usuário', 'credit')
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition"
                        aria-label="Creditar"
                      >
                        <Plus className="w-3 h-3" /> Creditar
                      </button>
                      <button
                        onClick={() =>
                          onAction(r.user_id, r.profiles?.nome ?? 'usuário', 'debit')
                        }
                        disabled={r.balance <= 0}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Debitar"
                      >
                        <Minus className="w-3 h-3" /> Debitar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
