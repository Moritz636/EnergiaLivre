'use client'

// ============================================================
// ToastBanner — Faixa simples de erro/sucesso.
// ============================================================

import { useEffect } from 'react'

type Variant = 'error' | 'success'

interface ToastBannerProps {
  message: string
  variant: Variant
  onDismiss?: () => void
  autoDismissMs?: number
}

const STYLES: Record<Variant, string> = {
  error: 'bg-red-500/10 border-red-500/30 text-red-300',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
}

export function ToastBanner({ message, variant, onDismiss, autoDismissMs }: ToastBannerProps) {
  useEffect(() => {
    if (!autoDismissMs || !onDismiss) return
    const t = setTimeout(onDismiss, autoDismissMs)
    return () => clearTimeout(t)
  }, [autoDismissMs, onDismiss, message])

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`mb-4 p-3 rounded-xl border text-sm ${STYLES[variant]}`}
    >
      {message}
    </div>
  )
}
