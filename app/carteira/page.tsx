'use client'

import React, { useState, useEffect, useCallback, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowLeft,
  ArrowRight,
  Banknote,
  ChevronLeft,
  Sparkles,
  Trash2,
  BadgeCheck,
  Server,
} from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'
import { saveLead, type SaveLeadInput } from '@/app/actions'
import { getSupabase } from '@/lib/supabase/singleton'

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) {
    return digits.slice(0, 2) + '/' + digits.slice(2)
  }
  return digits
}

function maskDisplayNumber(value: string): string {
  const plain = value.replace(/\s/g, '')
  if (plain.length <= 4) return plain
  const last4 = plain.slice(-4)
  const masked = plain.slice(0, -4).replace(/\d/g, '•')
  const formatted = (masked + last4).replace(/(\d{4}|•{4})(?=.)/g, '$1 ')
  return formatted.trim()
}

export default function CarteiraPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  })
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cardNumberRaw = formData.cardNumber.replace(/\s/g, '')

  const isStep1Valid =
    cardNumberRaw.length === 16 &&
    formData.expiry.replace(/\D/g, '').length === 4 &&
    formData.cvv.length === 3 &&
    formData.cardholderName.trim().length >= 3

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (step === 3) {
      successTimerRef.current = setTimeout(() => {
        router.push('/dashboard-consumidor')
      }, 3000)
      return () => {
        if (successTimerRef.current) clearTimeout(successTimerRef.current)
      }
    }
  }, [step, router])

  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setFormData((prev) => ({ ...prev, cardNumber: formatted }))
  }, [])

  const handleExpiryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    setFormData((prev) => ({ ...prev, expiry: formatted }))
  }, [])

  const handleCvvChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 3)
    setFormData((prev) => ({ ...prev, cvv: digits }))
  }, [])

  const handleCardholderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setFormData((prev) => ({ ...prev, cardholderName: value }))
  }, [])

  const handleNextClick = useCallback(() => {
    if (!isStep1Valid) return
    setStep(2)
    setPin('')
    setError(null)
  }, [isStep1Valid])

  const handlePinDigit = useCallback((digit: string) => {
    setPin((prev) => {
      if (prev.length >= 6) return prev
      return prev + digit
    })
    setError(null)
  }, [])

  const handlePinBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1))
  }, [])

  const handlePinSubmit = useCallback(async () => {
    if (pin.length < 4) return
    setSaving(true)
    setError(null)

    try {
      if (!user || !profile) {
        throw new Error('Usuário não autenticado')
      }

      const tipo = profile.tipo === 'gerador' ? 'gerador' as const : 'consumidor' as const

      const leadData: Record<string, unknown> = {
        tipo,
        nome: formData.cardholderName.trim(),
        email: profile.email,
        whatsapp: profile.whatsapp,
        cidade: profile.cidade,
        estado: profile.estado,
      }

      if (tipo === 'consumidor') {
        leadData.gastoMensal = 100
      } else {
        leadData.capacidadeKwp = 1
      }

      const result = await saveLead(leadData as SaveLeadInput)

      if (!result.success) {
        throw new Error(result.message || 'Erro ao salvar')
      }

      if (result.id) {
        const sb = getSupabase()
        const masked = cardNumberRaw.replace(/\d(?=\d{4})/g, '•')
        const formattedMasked = masked.replace(/(\d{4}|•{4})(?=.)/g, '$1 ')

        await (sb as any)
          .from('leads')
          .update({
            observacoes: JSON.stringify({
              tipoCartao: 'credito',
              numeroCartao: formattedMasked,
              validade: formData.expiry,
              titular: formData.cardholderName.trim(),
              registradoEm: new Date().toISOString(),
            }),
          })
          .eq('id', result.id)
      }

      setStep(3)
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar o cartão')
    } finally {
      setSaving(false)
    }
  }, [pin, user, profile, formData, cardNumberRaw])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center px-4 py-10 font-sans">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => (step === 2 ? setStep(1) : router.push('/dashboard-consumidor'))}
            className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-400 transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Painel' : 'Voltar'}
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            Ambiente Seguro
          </div>
        </div>

        <div className="mb-8 space-y-3">
          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                  s <= step
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 px-1">
            <span className={step >= 1 ? 'text-emerald-400 font-medium' : ''}>
              <CreditCard className="w-3 h-3 inline mr-1" />
              Passo 1/2 — Dados do Cartão
            </span>
            <span className={step >= 2 ? 'text-emerald-400 font-medium' : ''}>
              <Lock className="w-3 h-3 inline mr-1" />
              Passo 2/2 — Autenticação
            </span>
          </div>
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold text-white mb-1">
                Cadastro de Cartão
              </h2>
              <p className="text-sm text-slate-400">
                Adicione seu cartão para realizar pagamentos na plataforma
              </p>
            </div>

            <div className="relative">
              <div
                className="w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-6 md:p-7 shadow-2xl border border-white/5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-inner">
                    <span className="text-[8px] font-black text-yellow-900">CHIP</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-medium">
                      {profile.tipo === 'gerador' ? 'EnergiaLivre' : 'EnergiaLivre'}
                    </p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest">
                      Crédito
                    </p>
                  </div>
                </div>

                <div className="space-y-1 mt-2">
                  <p className="text-lg md:text-xl tracking-[4px] text-white font-mono">
                    {formData.cardNumber
                      ? maskDisplayNumber(formData.cardNumber)
                      : '•••• •••• •••• ••••'}
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest">
                      Titular
                    </p>
                    <p className="text-xs text-white font-medium tracking-wide">
                      {formData.cardholderName || 'NOME DO TITULAR'}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest">
                      Validade
                    </p>
                    <p className="text-xs text-white font-mono">
                      {formData.expiry || 'MM/AA'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 rounded-full blur-xl pointer-events-none" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  aria-label="Número do cartão"
                  maxLength={19}
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all hover:border-white/20 font-mono tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    Validade
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/AA"
                    aria-label="Data de validade"
                    maxLength={5}
                    value={formData.expiry}
                    onChange={handleExpiryChange}
                    className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all hover:border-white/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                    CVV
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    aria-label="Código de segurança"
                    maxLength={3}
                    value={formData.cvv}
                    onChange={handleCvvChange}
                    className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all hover:border-white/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  placeholder="Como impresso no cartão"
                  aria-label="Nome do titular do cartão"
                  value={formData.cardholderName}
                  onChange={handleCardholderChange}
                  className="w-full bg-slate-900/70 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all hover:border-white/20 uppercase tracking-wider"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 flex-wrap">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Criptografia SSL
              </div>
              <div className="flex items-center gap-1">
                <BadgeCheck className="w-3 h-3 text-emerald-500" />
                PCI Compliance
              </div>
              <div className="flex items-center gap-1">
                <Server className="w-3 h-3 text-emerald-500" />
                Stripe Secure
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-slate-400 text-center leading-relaxed">
              <Lock className="w-3 h-3 inline mr-1 text-emerald-400" />
              Não compartilhamos seus dados de cartão com terceiros. Suas informações estão protegidas com criptografia de ponta a ponta.
            </div>

            <button
              onClick={handleNextClick}
              disabled={!isStep1Valid}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-800 text-slate-900 disabled:text-slate-500 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] disabled:shadow-none"
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in duration-300">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 via-emerald-400 to-emerald-500/50" />

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/20 rounded-full mb-4">
                    <Lock className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Autenticação de Cartão
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Para sua segurança, confirme seu cartão
                  </p>
                </div>

                <div className="flex justify-center gap-3 mb-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        i < pin.length
                          ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                          : 'border-slate-600 bg-transparent'
                      } ${i === pin.length ? 'animate-pulse border-emerald-400/50' : ''}`}
                    />
                  ))}
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 text-center">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <button
                      key={n}
                      onClick={() => handlePinDigit(String(n))}
                      className="aspect-square rounded-2xl bg-slate-700/50 hover:bg-slate-600/50 active:bg-slate-500/50 text-white text-xl font-bold border border-white/5 transition-all active:scale-95"
                    >
                      {n}
                    </button>
                  ))}
                  <div />
                  <button
                    onClick={() => handlePinDigit('0')}
                    className="aspect-square rounded-2xl bg-slate-700/50 hover:bg-slate-600/50 active:bg-slate-500/50 text-white text-xl font-bold border border-white/5 transition-all active:scale-95"
                  >
                    0
                  </button>
                  <button
                    onClick={handlePinBackspace}
                    className="aspect-square rounded-2xl bg-slate-700/50 hover:bg-slate-600/50 active:bg-slate-500/50 text-slate-300 border border-white/5 transition-all flex items-center justify-center active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handlePinSubmit}
                  disabled={pin.length < 4 || saving}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-800 text-slate-900 disabled:text-slate-500 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:shadow-none"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirmando…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Confirmar
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-600 text-center mt-4">
                  PIN de 4 a 6 dígitos
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in zoom-in duration-500 text-center space-y-6 py-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/20 rounded-full">
              <CheckCircle2 className="w-14 h-14 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Cartão Cadastrado!
              </h2>
              <p className="text-sm text-slate-400">
                Seu cartão foi registrado com sucesso e estará disponível para pagamentos futuros.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 inline-flex items-center gap-3 mx-auto">
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-slate-300" />
              </div>
              <div className="text-left">
                <p className="text-sm text-white font-mono tracking-wider">
                  {cardNumberRaw.replace(/\d(?=\d{4})/g, '•').replace(/(.{4})(?=.)/g, '$1 ')}
                </p>
                <p className="text-[10px] text-slate-500">
                  {formData.cardholderName}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Redirecionando para o painel…
            </div>

            <p className="text-[10px] text-slate-600">
              <Lock className="w-3 h-3 inline mr-1" />
              Seus dados estão protegidos com criptografia de ponta a ponta
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
