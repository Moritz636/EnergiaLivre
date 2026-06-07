'use client'

// ============================================================
// PaymentInstructions — Modal com instruções de pagamento Pix
// (Fase 1: dados estáticos. Fase 2: integração Asaas/Mercado Pago)
// ============================================================

import { useEffect } from 'react'
import { X, Copy, Check, Smartphone, ArrowRight } from 'lucide-react'
import { PIX_KEY, PIX_KEY_RAW, PIX_RECEIVER } from '@/lib/credits-shared'

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
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pix-title"
    >
      <div
        className="bg-gradient-to-b from-[#0a0f1e] to-[#020617] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-emerald-300" />
            </div>
            <h2 id="pix-title" className="text-base font-bold text-white">
              Pagar com Pix
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </header>

        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Valor
            </p>
            <p className="text-3xl font-black text-emerald-400 mt-1">
              R$ {amount.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <ol className="space-y-3 text-sm text-slate-300">
            <Step n={1}>
              Abra o app do seu banco e escolha <strong>Pix Copia e Cola</strong> ou
              <strong> Pix QR Code</strong>.
            </Step>
            <Step n={2}>
              Use a chave abaixo (WhatsApp/telefone) e envie{' '}
              <strong className="text-emerald-300">exatamente R$ {amount.toFixed(2).replace('.', ',')}</strong>.
            </Step>
            <Step n={3}>
              Após pagar, clique em{' '}
              <strong className="text-emerald-300">&ldquo;Já paguei&rdquo;</strong> e aguarde a
              confirmação do admin (em até 24h úteis).
            </Step>
          </ol>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <Row label="Chave Pix (WhatsApp)">
              <code className="text-emerald-300 font-mono text-sm font-bold">
                {PIX_KEY}
              </code>
              <CopyButton value={PIX_KEY_RAW} />
            </Row>
            <Row label="Favorecido">
              <span className="text-white text-sm font-medium">{PIX_RECEIVER}</span>
            </Row>
            <Row label="Tipo">
              <span className="text-white text-sm">Chave aleatória (WhatsApp)</span>
            </Row>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-200 leading-relaxed">
            <strong>Importante:</strong> o crédito é ativado manualmente após a
            confirmação do pagamento. Em caso de dúvida, envie o comprovante pelo
            WhatsApp <strong>(84) 98758-6668</strong>.
          </div>
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
            disabled={confirming}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {confirming ? 'Enviando...' : 'Já paguei'}
            {!confirming && <ArrowRight className="w-4 h-4" />}
          </button>
        </footer>
      </div>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-black">
        {n}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  return (
    <button
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(value).catch(() => {})
        }
      }}
      className="p-1.5 rounded-md hover:bg-white/10 transition group"
      aria-label="Copiar chave Pix"
    >
      <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300" />
    </button>
  )
}
