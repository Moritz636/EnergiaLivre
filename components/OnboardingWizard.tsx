'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase/singleton'
import { X, Zap, Upload, UserCheck, Sparkles, ArrowRight, MessageCircle, FileText, Heart } from 'lucide-react'
import Link from 'next/link'

interface OnboardingWizardProps {
  userId: string
  profile: { nome?: string | null; cidade?: string | null; tipo?: string | null }
  onComplete: () => void
}

const steps = [
  {
    icon: Upload,
    title: 'Envie sua conta de energia',
    description: 'Tire uma foto ou faça upload da sua conta de luz. Em segundos analisamos seu consumo.',
    action: { label: 'Enviar fatura', href: '/dashboard/faturas' },
    skip: false,
  },
  {
    icon: UserCheck,
    title: 'Complete seu perfil',
    description: 'Informe seu gasto mensal com energia para receber propostas personalizadas.',
    action: { label: 'Completar perfil', href: '/dashboard-consumidor' },
    skip: true,
  },
  {
    icon: Heart,
    title: 'Encontre o melhor match',
    description: 'Descubra geradores de energia solar perto de você e comece a economizar.',
    action: { label: 'Ver matches', href: '/dashboard/match' },
    skip: false,
  },
  {
    icon: Sparkles,
    title: 'Pronto!',
    description: 'Seu painel está configurado. A partir de agora você recebe notificações em tempo real de propostas e matches.',
    action: { label: 'Começar!', href: '' },
    skip: false,
  },
]

export default function OnboardingWizard({ userId, profile, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [show, setShow] = useState(false)
  const [checking, setChecking] = useState(true)
  const supabase = getSupabase()

  useEffect(() => {
    if (!userId) { setChecking(false); return }
    ;(async () => {
      try {
        // Mostra onboarding para novos usuários sem faturas OU perfil incompleto
        const { count } = await supabase
          .from('invoice_uploads')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        const hasInvoices = (count ?? 0) > 0
        const hasProfile = !!(profile?.cidade)

        if (!hasInvoices || !hasProfile) {
          setShow(true)
        }
      } catch { /* ignora */ }
      setChecking(false)
    })()
  }, [userId, supabase, profile])

  if (checking || !show) return null

  const current = steps[step]
  const isLast = step >= steps.length - 1

  const handleNext = () => {
    if (isLast) {
      setShow(false)
      onComplete()
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <button
          onClick={() => { setShow(false); onComplete() }}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Passo {step + 1} de {steps.length}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <current.icon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{current.title}</h3>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            {current.description}
          </p>

          <div className="flex items-center gap-3">
            {current.action.href ? (
              <Link
                href={current.action.href}
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm rounded-xl transition-colors"
              >
                {current.action.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm rounded-xl transition-colors"
              >
                {current.action.label}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {!isLast && current.skip && (
              <button
                onClick={handleNext}
                className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Pular
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
