'use client'
import React from 'import { supabase } from '@/lib/supabase'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

import {
  ArrowRight,
  Leaf,
  Zap,
  TrendingUp,
  Users,
  Globe,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  Award,
  Crown,
  Flame,
  Sparkles,
  BadgeCheck,
  TrendingDown
} from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth(false) // NÃO bloquear home

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Carregando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <nav className="p-6 flex justify-between">
        <h1>EnergiaLivre</h1>

        {user ? (
          <Link href="/dashboard">Dashboard</Link>
        ) : (
          <Link href="/login">Entrar</Link>
        )}
      </nav>

      <div className="p-20 text-center">
        <h1 className="text-5xl font-bold text-white">
          Energia solar compartilhada
        </h1>

        <p className="text-slate-400 mt-4">
          Marketplace de energia limpa
        </p>

        {!user && (
          <Link
            href="/cadastro"
            className="mt-10 inline-block bg-emerald-500 px-6 py-3 rounded-xl text-black font-bold"
          >
            Começar agora
          </Link>
        )}
      </div>
    </div>
  )
}