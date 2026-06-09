'use client'

// ============================================================
// PaymentInstructions — Modal com QR Code PIX + copia e cola
// ============================================================

import { useEffect, useState, useCallback } from 'react'
import { X, Copy, Check, Smartphone, ArrowRight, Loader2, QrCode, Clock } from 'lucide-react'

interface PaymentInstructionsProps {
  open: boolean
  onClose: () => void
  amount: number
  onConfirm: () => void | Promise<void>
  confirming?: boolean
}

export function PaymentInstructions({
  open,
  onClose,
  amount,
  onConfirm,
  confirming,
}: PaymentInstructionsProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [payload, setPayload] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateQr = useCallback(async () => {
    if (!open || amount <= 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/user/credits/pix-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao gerar QR Code')
      setQrCode(body.qrCodeBase64)
      setPayload(body.payload)
      setExpiresAt(body.expiresAt)
    } catch (err: any) {
      setError(err?.message || 'Erro ao gerar QR Code')
    } finally {
      setLoading(false)
    }
  }, [open, amount])

  useEffect(() => {
    if (open) {
      generateQr()
    } else {
      setQrCode(null)
      setPayload(null)
      setExpiresAt(null)
      setError(null)
    }
  }, [open, generateQr])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleCopy = async () => {
    if (!payload) return
    try {
      await navigator.clipboard.writeText(payload)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = payload
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const expiresIn = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60000))
    : null

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gradient-to-b from-[#0a0f1e] to-[#020617] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pagamento via Pix</h2>
              <p className="text-[10px] text-slate-400">QR Code auto-gerado</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" aria-label="Fechar">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </header>

        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Valor</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">
              R$ {amount.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm text-slate-400">Gerando QR Code...</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={generateQr}
                className="mt-2 text-xs text-emerald-400 hover:underline font-bold"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {qrCode && !loading && (
            <>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-3 rounded-xl">
                  <img src={qrCode} alt="QR Code Pix" className="w-52 h-52 rounded-lg" />
                </div>
                {expiresIn !== null && expiresIn > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    Expira em {expiresIn} minuto{expiresIn === 1 ? '' : 's'}
                  </div>
                )}
              </div>

              <div className="w-full">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                  Código Pix (copia e cola)
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-[9px] text-slate-300 break-all leading-relaxed select-all max-h-16 overflow-y-auto font-mono">
                    {payload}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 transition"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <ol className="space-y-2 text-xs text-slate-300">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-black">1</span>
                  <span>Abra o app do banco e escolha <strong>Pix Copia e Cola</strong> ou <strong>QR Code</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-black">2</span>
                  <span>Escaneie o QR Code ou cole o código acima</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-black">3</span>
                  <span>Confirme o pagamento de <strong className="text-emerald-300">R$ {amount.toFixed(2).replace('.', ',')}</strong></span>
                </li>
              </ol>
            </>
          )}
        </div>

        <footer className="p-5 border-t border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming || loading || !qrCode}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {confirming ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
            ) : (
              <><span>Já paguei</span> <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
