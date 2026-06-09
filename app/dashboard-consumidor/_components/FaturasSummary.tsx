'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Upload, Scan, Loader2 } from 'lucide-react'
import { getSupabase } from '@/lib/supabase/singleton'

interface FaturaSummary {
  total: number
  pendentes: number
  aVencer: number
  ultima: string | null
}

export default function FaturasSummary({ userId }: { userId: string }) {
  const [data, setData] = useState<FaturaSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const supabase = getSupabase()
        const { data: rows } = await supabase
          .from('invoice_uploads')
          .select('status, vencimento, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (cancelled) return
        const list = (rows ?? []) as any[]
        const now = new Date()
        const pendentes = list.filter((r) => ['pending', 'analyzing'].includes(r.status)).length
        const aVencer = list.filter((r) => {
          if (!r.vencimento) return false
          const v = new Date(r.vencimento)
          return v >= now && v <= new Date(now.getTime() + 7 * 86400000)
        }).length

        setData({
          total: list.length,
          pendentes,
          aVencer,
          ultima: list[0]?.created_at ?? null,
        })
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center h-24">
        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 border border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <FileText className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Suas Faturas</p>
          <p className="text-[10px] text-slate-500">
            {data?.total === 0
              ? 'Nenhuma fatura enviada'
              : `${data?.total} fatura${(data?.total ?? 0) > 1 ? 's' : ''} cadastrada${(data?.total ?? 0) > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-white/5">
          <p className="text-lg font-black text-white">{data?.total ?? 0}</p>
          <p className="text-[9px] text-slate-500">Total</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-yellow-500/10">
          <p className="text-lg font-black text-yellow-400">{data?.pendentes ?? 0}</p>
          <p className="text-[9px] text-slate-500">Pendentes</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-orange-500/10">
          <p className="text-lg font-black text-orange-400">{data?.aVencer ?? 0}</p>
          <p className="text-[9px] text-slate-500">A vencer</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href="/dashboard/faturas/upload"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-bold transition"
        >
          <Upload className="w-3 h-3" /> Enviar
        </Link>
        <Link
          href="/dashboard/faturas/scan"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition"
        >
          <Scan className="w-3 h-3" /> Escanear
        </Link>
        <Link
          href="/dashboard/faturas"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition"
        >
          Ver todas
        </Link>
      </div>
    </div>
  )
}
