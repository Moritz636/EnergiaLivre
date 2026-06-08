'use client'

import { useState } from 'react'
import { Copy, Check, QrCode, Clock } from 'lucide-react'

interface PixQRCodeProps {
  qrCodeBase64: string | null
  qrCode: string | null
  expiresAt: string | null
  paymentIntentId: string
  clientSecret: string
  onPaymentComplete: () => void
}

export function PixQRCode({
  qrCodeBase64,
  qrCode,
  expiresAt,
  paymentIntentId,
  onPaymentComplete,
}: PixQRCodeProps) {
  const [copied, setCopied] = useState(false)
  const [polling, setPolling] = useState(false)

  const handleCopy = async () => {
    if (!qrCode) return
    try {
      await navigator.clipboard.writeText(qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = qrCode
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const expiresDate = expiresAt ? new Date(expiresAt) : null
  const expiresIn = expiresDate
    ? Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / 60000))
    : null

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Pagamento via Pix</h3>
      </div>

      <div className="flex flex-col items-center gap-4">
        {qrCodeBase64 ? (
          <div className="bg-white p-3 rounded-xl">
            <Picture src={qrCodeBase64} alt="QR Code Pix" />
          </div>
        ) : (
          <div className="bg-slate-800/50 p-8 rounded-xl w-full flex items-center justify-center">
            <p className="text-xs text-slate-400">QR Code nao disponivel</p>
          </div>
        )}

        <div className="w-full">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
            Codigo Pix (copia e cola)
          </p>
          <div className="flex gap-2">
            <code className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-slate-300 break-all leading-relaxed select-all max-h-20 overflow-y-auto">
              {qrCode ?? '—'}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 transition"
              aria-label="Copiar codigo Pix"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {expiresIn !== null && expiresIn > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Clock className="w-3 h-3" />
            O QR Code expira em {expiresIn} minuto{expiresIn === 1 ? '' : 's'}
          </div>
        )}
        {expiresIn === 0 && (
          <div className="text-[10px] text-red-300 font-bold">
            QR Code expirado — tente novamente
          </div>
        )}

        {polling && (
          <div className="flex items-center gap-2 text-[11px] text-yellow-300">
            <Clock className="w-3 h-3 animate-pulse" />
            Aguardando confirmacao do pagamento...
          </div>
        )}
      </div>
    </div>
  )
}

function Picture({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)
  if (error || !src.startsWith('data:')) {
    return (
      <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg">
        <QrCode className="w-12 h-12 text-slate-400" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-48 h-48 rounded-lg"
      onError={() => setError(true)}
    />
  )
}
