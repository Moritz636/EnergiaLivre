'use client'

import { useState } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Smartphone, CheckCircle2, Loader2, ArrowRight, Copy, Check, QrCode, ArrowLeft, Sparkles, AlertCircle, Zap } from 'lucide-react'

const OPERADORAS = [
  { id: 'vivo', name: 'Vivo', color: 'from-purple-500 to-purple-600' },
  { id: 'claro', name: 'Claro', color: 'from-red-500 to-red-600' },
  { id: 'tim', name: 'TIM', color: 'from-blue-500 to-blue-600' },
  { id: 'oi', name: 'Oi', color: 'from-yellow-500 to-yellow-600' },
] as const

const VALORES = [10, 15, 20, 25, 30, 50, 100] as const

type Step = 'select' | 'pay' | 'done'

interface PaymentData {
  recargaId: string
  payment: {
    id: string
    txid: string
    amount: number
    status: string
    qrCode: string
    pixCopyPaste: string
    expiresAt: string
  }
}

export default function RecargasPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('select')
  const [operadora, setOperadora] = useState<typeof OPERADORAS[number]['id'] | null>(null)
  const [numero, setNumero] = useState('')
  const [valor, setValor] = useState<typeof VALORES[number] | null>(null)
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [polling, setPolling] = useState(false)
  const [paid, setPaid] = useState(false)

  const numeroClean = numero.replace(/\D/g, '')
  const numeroValid = numeroClean.length >= 10 && numeroClean.length <= 11

  const handleCreate = async () => {
    if (!operadora || !valor || !numeroValid) {
      setError('Preencha todos os campos.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/recargas/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operadora, numero: numeroClean, valor }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Erro ao criar recarga')
        return
      }
      setPayment(body)
      setStep('pay')
      // Inicia polling de status
      startPolling(body.payment.txid)
    } catch (err: any) {
      setError(err?.message || 'Erro de rede')
    } finally {
      setSubmitting(false)
    }
  }

  const startPolling = (txid: string) => {
    setPolling(true)
    let attempts = 0
    const max = 60 // 5 min @ 5s
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/pix/status?txid=${txid}`)
        const body = await res.json()
        if (body.success && body.status === 'paid') {
          clearInterval(interval)
          setPaid(true)
          setPolling(false)
          setStep('done')
        }
      } catch {
        // ignore
      }
      if (attempts >= max) {
        clearInterval(interval)
        setPolling(false)
      }
    }, 5000)
  }

  // Dev helper: simular pagamento (apenas para testes sem PIX real)
  const simulatePayment = async () => {
    if (!payment) return
    setSubmitting(true)
    try {
      await fetch('/api/pix/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: payment.payment.txid, status: 'paid' }),
      })
      setPaid(true)
      setStep('done')
    } catch (err: any) {
      setError(err?.message || 'Erro ao simular')
    } finally {
      setSubmitting(false)
    }
  }

  const copyPix = async () => {
    if (!payment) return
    try {
      await navigator.clipboard.writeText(payment.payment.pixCopyPaste)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
        <div className="max-w-md mx-auto pt-12 text-center">
          <Smartphone className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
          <p className="text-slate-300 mb-4">Você precisa estar logado.</p>
          <Link href="/login?redirect=/recargas" className="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-900 font-bold">
            Entrar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/5" aria-label="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white">Recarga de celular</h1>
            <p className="text-[10px] text-slate-400">PIX · Cashback 5% em KWATT</p>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-3xl mx-auto">
        <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
          <p className="text-xs text-cyan-200">
            <strong>Novidade:</strong> Quem paga recarga com PIX recebe 5% de cashback em KWATT.
            Token chega na sua carteira no dia 05/01/2027.
          </p>
        </div>

        {step === 'select' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase mb-2">1. Escolha a operadora</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {OPERADORAS.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setOperadora(op.id)}
                    className={`p-3 rounded-xl border transition ${
                      operadora === op.id
                        ? 'bg-white/10 border-cyan-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-8 h-8 mx-auto rounded-lg mb-1 bg-gradient-to-br ${op.color} flex items-center justify-center text-white font-black text-sm`}>
                      {op.name[0]}
                    </div>
                    <p className="text-xs font-bold text-white">{op.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase mb-2">2. Número do celular</h2>
              <input
                type="tel"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="(84) 99999-8888"
                maxLength={13}
                className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-white/10 text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
              />
              {numero && !numeroValid && (
                <p className="text-xs text-red-400 mt-1">Digite DDD + número (10 ou 11 dígitos)</p>
              )}
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase mb-2">3. Valor da recarga</h2>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {VALORES.map((v) => (
                  <button
                    key={v}
                    onClick={() => setValor(v)}
                    className={`py-2.5 rounded-lg font-bold text-sm transition ${
                      valor === v
                        ? 'bg-cyan-500 text-slate-900'
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={!operadora || !valor || !numeroValid || submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 text-slate-900 font-black transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {submitting ? 'Gerando PIX...' : `Continuar · R$ ${valor ?? 0}`}
            </button>
          </div>
        )}

        {step === 'pay' && payment && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <h2 className="text-lg font-bold text-white mb-1">Pague com PIX</h2>
              <p className="text-xs text-slate-400 mb-4">
                {operadora?.toUpperCase()} · {numero} · R$ {payment.payment.amount.toFixed(2)}
              </p>

              <div className="bg-white p-4 rounded-xl inline-block">
                <QRCodeVisual value={payment.payment.pixCopyPaste} size={200} />
              </div>

              <p className="text-[10px] text-slate-500 mt-3">
                QR Code gerado. Escaneie no app do seu banco.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">PIX Copia e Cola</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={payment.payment.pixCopyPaste}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-[10px] text-white font-mono truncate"
                />
                <button
                  onClick={copyPix}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-900 text-xs font-bold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {polling && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Aguardando confirmação do pagamento...
              </div>
            )}

            {/* Dev helper */}
            {process.env.NODE_ENV !== 'production' && (
              <button
                onClick={simulatePayment}
                disabled={submitting}
                className="w-full py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold"
              >
                🛠 Simular pagamento confirmado (apenas DEV)
              </button>
            )}

            <p className="text-[10px] text-slate-500 text-center">
              Após o pagamento, sua recarga é processada em até 5 minutos.
              Você recebe 5% de cashback em KWATT automaticamente.
            </p>
          </div>
        )}

        {step === 'done' && payment && (
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Recarga confirmada!</h2>
            <p className="text-slate-300 mb-1">
              {operadora?.toUpperCase()} · {numero}
            </p>
            <p className="text-3xl font-black text-emerald-400 mb-4">R$ {payment.payment.amount.toFixed(2)}</p>
            <div className="inline-block p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <p className="text-xs text-amber-200">
                <Sparkles className="w-3.5 h-3.5 inline" /> Você ganhou <strong className="text-white">
                  {(payment.payment.amount * 0.05 / 0.285).toFixed(0)} KWATT
                </strong> de cashback 🎁
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => {
                  setStep('select')
                  setOperadora(null)
                  setNumero('')
                  setValor(null)
                  setPayment(null)
                  setPaid(false)
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
              >
                Fazer outra recarga
              </button>
              <Link
                href="/dashboard-consumidor"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-900 font-bold transition flex items-center justify-center gap-1"
              >
                Voltar ao dashboard <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Componente simples de QR Code visual (placeholder - pode usar lib real depois)
function QRCodeVisual({ value, size = 200 }: { value: string; size?: number }) {
  // Placeholder visual - em produção usar 'qrcode.react' ou similar
  // Por enquanto, mostra um padrão visual + o valor
  return (
    <div
      style={{ width: size, height: size }}
      className="relative bg-white"
    >
      <svg viewBox="0 0 21 21" className="w-full h-full" aria-label="QR Code">
        {/* Quadrantes padrão de QR Code */}
        {Array.from({ length: 21 * 21 }).map((_, i) => {
          const x = i % 21
          const y = Math.floor(i / 21)
          // Padrão determinístico baseado no hash do value
          const hash = (value.charCodeAt((i * 7) % value.length) + i) % 7
          const isCorner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
          const isCornerBorder = isCorner && (x === 0 || x === 6 || y === 0 || y === 6 ||
                                                (x > 13 && (x === 14 || x === 20)) ||
                                                (y > 13 && (y === 14 || y === 20)))
          const isCornerCenter = isCorner && x >= 2 && x <= 4 && y >= 2 && y <= 4
          if (isCornerBorder || isCornerCenter) {
            return <rect key={i} x={x} y={y} width="1" height="1" fill="black" />
          }
          if (isCorner) return null
          if (hash < 3) {
            return <rect key={i} x={x} y={y} width="1" height="1" fill="black" />
          }
          return null
        })}
      </svg>
    </div>
  )
}
