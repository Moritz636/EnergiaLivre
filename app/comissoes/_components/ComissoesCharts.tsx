'use client'

// ============================================================
// ComissoesCharts — Interactive charts using pure CSS/SVG
// Shows monthly evolution, status breakdown, and type distribution
// ============================================================

import { useMemo } from 'react'
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react'
import type { ComissaoItem } from './CommissionsTable'

interface ComissoesChartsProps {
  items: ComissaoItem[]
}

export function ComissoesCharts({ items }: ComissoesChartsProps) {
  const monthlyData = useMemo(() => {
    const map = new Map<string, { pago: number; pendente: number; cancelado: number }>()
    items.forEach((c) => {
      const d = c.data_pagamento ? new Date(c.data_pagamento) : new Date()
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, { pago: 0, pendente: 0, cancelado: 0 })
      const entry = map.get(key)!
      if (c.status_pagamento === 'pago') entry.pago += c.valor_comissao
      else if (c.status_pagamento === 'pendente') entry.pendente += c.valor_comissao
      else entry.cancelado += c.valor_comissao
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => ({
        label: key,
        ...val,
        total: val.pago + val.pendente + val.cancelado,
      }))
  }, [items])

  const statusBreakdown = useMemo(() => {
    let pago = 0, pendente = 0, cancelado = 0
    items.forEach((c) => {
      if (c.status_pagamento === 'pago') pago += c.valor_comissao
      else if (c.status_pagamento === 'pendente') pendente += c.valor_comissao
      else cancelado += c.valor_comissao
    })
    const total = pago + pendente + cancelado || 1
    return { pago, pendente, cancelado, total }
  }, [items])

  const typeBreakdown = useMemo(() => {
    let cadastro = 0, recorrente = 0
    items.forEach((c) => {
      if (c.tipo_comissao === 'cadastro') cadastro += c.valor_comissao
      else recorrente += c.valor_comissao
    })
    const total = cadastro + recorrente || 1
    return { cadastro, recorrente, total }
  }, [items])

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      {/* Monthly Evolution Bar Chart */}
      <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Evolução Mensal</h3>
          <span className="text-[10px] text-slate-500 ml-auto">Últimos 6 meses</span>
        </div>
        {monthlyData.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">Sem dados para exibir</p>
        ) : (
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((m, i) => {
              const pagoH = (m.pago / maxMonthly) * 100
              const pendH = (m.pendente / maxMonthly) * 100
              const cancelH = (m.cancelado / maxMonthly) * 100
              const [year, month] = m.label.split('-')
              const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-slate-400 font-bold">
                    R$ {m.total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="w-full flex flex-col justify-end rounded-t-lg overflow-hidden" style={{ height: '120px' }}>
                    {m.cancelado > 0 && (
                      <div
                        className="bg-red-500/60 transition-all duration-500"
                        style={{ height: `${cancelH}%`, minHeight: cancelH > 0 ? '4px' : '0' }}
                      />
                    )}
                    {m.pendente > 0 && (
                      <div
                        className="bg-yellow-500/60 transition-all duration-500"
                        style={{ height: `${pendH}%`, minHeight: pendH > 0 ? '4px' : '0' }}
                      />
                    )}
                    <div
                      className="bg-emerald-500/60 transition-all duration-500"
                      style={{ height: `${pagoH}%`, minHeight: pagoH > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {monthNames[parseInt(month) - 1]}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex items-center gap-4 mt-4 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Pago</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Pendente</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Cancelado</span>
        </div>
      </div>

      {/* Status Breakdown Donut */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieIcon className="w-5 h-5 text-yellow-400" />
          <h3 className="text-sm font-bold text-white">Por Status</h3>
        </div>
        <div className="flex justify-center mb-6">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
            {statusBreakdown.pago > 0 && (
              <circle
                cx="70" cy="70" r="56" fill="none"
                stroke="#10b981" strokeWidth="14"
                strokeDasharray={`${(statusBreakdown.pago / statusBreakdown.total) * 352} 352`}
                strokeDashoffset="0"
                transform="rotate(-90 70 70)"
                className="transition-all duration-700"
              />
            )}
            {statusBreakdown.pendente > 0 && (
              <circle
                cx="70" cy="70" r="56" fill="none"
                stroke="#eab308" strokeWidth="14"
                strokeDasharray={`${(statusBreakdown.pendente / statusBreakdown.total) * 352} 352`}
                strokeDashoffset={`${-(statusBreakdown.pago / statusBreakdown.total) * 352}`}
                transform="rotate(-90 70 70)"
                className="transition-all duration-700"
              />
            )}
            {statusBreakdown.cancelado > 0 && (
              <circle
                cx="70" cy="70" r="56" fill="none"
                stroke="#ef4444" strokeWidth="14"
                strokeDasharray={`${(statusBreakdown.cancelado / statusBreakdown.total) * 352} 352`}
                strokeDashoffset={`${-((statusBreakdown.pago + statusBreakdown.pendente) / statusBreakdown.total) * 352}`}
                transform="rotate(-90 70 70)"
                className="transition-all duration-700"
              />
            )}
            <text x="70" y="66" textAnchor="middle" className="fill-white text-lg font-bold">
              {((statusBreakdown.pago / statusBreakdown.total) * 100).toFixed(0)}%
            </text>
            <text x="70" y="82" textAnchor="middle" className="fill-slate-400 text-[10px]">
              pago
            </text>
          </svg>
        </div>
        <div className="space-y-3">
          <StatusRow label="Pago" value={statusBreakdown.pago} total={statusBreakdown.total} color="bg-emerald-500" />
          <StatusRow label="Pendente" value={statusBreakdown.pendente} total={statusBreakdown.total} color="bg-yellow-500" />
          <StatusRow label="Cancelado" value={statusBreakdown.cancelado} total={statusBreakdown.total} color="bg-red-500" />
        </div>
        <p className="text-[10px] text-slate-600 mt-4 text-center">
          Comissões são pagas após 30 dias, todo dia 3 de cada mês.
        </p>
      </div>

      {/* Type Distribution */}
      <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Distribuição por Tipo</h3>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Cadastros ({((typeBreakdown.cadastro / typeBreakdown.total) * 100).toFixed(0)}%)</span>
              <span className="text-xs text-emerald-400 font-bold">R$ {typeBreakdown.cadastro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${(typeBreakdown.cadastro / typeBreakdown.total) * 100}%` }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Recorrentes ({((typeBreakdown.recorrente / typeBreakdown.total) * 100).toFixed(0)}%)</span>
              <span className="text-xs text-cyan-400 font-bold">R$ {typeBreakdown.recorrente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${(typeBreakdown.recorrente / typeBreakdown.total) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-slate-400 flex-1">{label}</span>
      <span className="text-xs text-white font-bold">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      <span className="text-[10px] text-slate-500 w-12 text-right">{pct.toFixed(0)}%</span>
    </div>
  )
}
