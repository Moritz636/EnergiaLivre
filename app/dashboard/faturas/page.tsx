'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/hooks/useAuth'
import InvoiceList from '@/components/Invoice/InvoiceList'
import { ArrowLeft, FileText, Upload, Loader2 } from 'lucide-react'

export default function FaturasIndexPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?from=' + (profile?.tipo ?? 'consumidor'))
    }
  }, [user, loading, profile, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#020617]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={
                profile?.tipo === 'gerador'
                  ? '/dashboard-gerador'
                  : profile?.tipo === 'parceiro'
                    ? '/embaixador/dashboard'
                    : '/dashboard-consumidor'
              }
              className="p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </Link>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <FileText className="text-cyan-400 w-4 h-4" />
            </div>
            <span className="text-xl font-black text-white">FATURAS</span>
          </div>
          <Link
            href="/dashboard/faturas/upload"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#020617] text-sm font-bold transition"
          >
            <Upload className="w-4 h-4" /> Nova
          </Link>
        </div>
      </nav>

      <main className="pt-20 pb-8 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white mb-1">Suas faturas</h1>
          <p className="text-sm text-slate-400">
            Envie a foto ou PDF da sua conta de luz. Identificamos estado, concessionária e valor automaticamente.
          </p>
        </div>
        <InvoiceList />
      </main>
    </div>
  )
}
