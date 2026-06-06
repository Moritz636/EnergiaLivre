'use client'

// ============================================================
// Tooltip — Wrapper acessível com posicionamento inteligente
// ------------------------------------------------------------
// - Aparece em hover (mouse) e focus (teclado) — atende a11y.
// - Suporta `side` (top|bottom) e `align` (start|center|end).
// - Usa position fixed (portal invisível) e calcula
//   automaticamente a posição para nunca cortar nas bordas.
// ============================================================

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'

export type TooltipSide = 'top' | 'bottom'
export type TooltipAlign = 'start' | 'center' | 'end'

interface TooltipProps {
  content: ReactNode
  children: ReactElement
  side?: TooltipSide
  align?: TooltipAlign
  /** Distância (px) entre trigger e tooltip */
  offset?: number
  /** Atraso de abertura (ms) — evita flicker em movimento rápido */
  delay?: number
  /** Largura máxima do balão (px) */
  maxWidth?: number
  className?: string
}

interface Position {
  top: number
  left: number
  placement: TooltipSide
}

export default function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  offset = 10,
  delay = 120,
  maxWidth = 280,
  className = '',
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const id = useId()

  // Reposiciona ao abrir e em scroll/resize
  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()

    // Decide lado: se não cabe em cima, abre embaixo
    let placement: TooltipSide = side
    if (side === 'top' && rect.top < 80) placement = 'bottom'

    const tooltipWidth = tooltipRef.current?.offsetWidth ?? maxWidth
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 56

    let left = rect.left + rect.width / 2 - tooltipWidth / 2
    let top =
      placement === 'top'
        ? rect.top - tooltipHeight - offset
        : rect.bottom + offset

    // Ajustes de alinhamento
    if (align === 'start') {
      left = rect.left
    } else if (align === 'end') {
      left = rect.right - tooltipWidth
    }

    // Garante que não corta nas bordas horizontais
    const margin = 8
    const maxLeft = window.innerWidth - tooltipWidth - margin
    left = Math.max(margin, Math.min(left, maxLeft))

    // Garante que não corta na base
    if (placement === 'bottom' && top + tooltipHeight > window.innerHeight - margin) {
      top = window.innerHeight - tooltipHeight - margin
    }
    if (placement === 'top' && top < margin) {
      top = margin
    }

    setPosition({ top, left, placement })
  }, [side, align, offset, maxWidth])

  useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (openTimer.current) clearTimeout(openTimer.current)
    openTimer.current = setTimeout(() => setOpen(true), delay)
  }

  const hide = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 80)
  }

  // Clona o children para injetar handlers e refs
  if (!isValidElement(children)) {
    return children
  }

  const trigger = cloneElement(children as ReactElement<any>, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node
      const childRef = (children as any).ref
      if (typeof childRef === 'function') childRef(node)
      else if (childRef && typeof childRef === 'object') childRef.current = node
    },
    onMouseEnter: (e: React.MouseEvent) => {
      show()
      ;(children as any).props?.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide()
      ;(children as any).props?.onMouseLeave?.(e)
    },
    onFocus: (e: React.FocusEvent) => {
      show()
      ;(children as any).props?.onFocus?.(e)
    },
    onBlur: (e: React.FocusEvent) => {
      hide()
      ;(children as any).props?.onBlur?.(e)
    },
    'aria-describedby': open ? `tooltip-${id}` : undefined,
  })

  // SSR-safe: só monta portal no client
  const isClient = typeof window !== 'undefined'

  return (
    <>
      {trigger}
      {isClient && open && position
        ? createPortal(
            <div
              ref={tooltipRef}
              id={`tooltip-${id}`}
              role="tooltip"
              className={`pointer-events-none fixed z-[60] animate-fade-down ${className}`}
              style={{
                top: position.top,
                left: position.left,
                maxWidth,
              }}
            >
              <div className="relative rounded-xl border border-emerald-500/30 bg-slate-950/95 backdrop-blur-md px-3.5 py-2.5 text-xs leading-relaxed text-slate-200 shadow-xl shadow-emerald-500/10">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{content}</span>
                </div>
                {/* Seta do tooltip */}
                <span
                  className={`absolute h-2 w-2 rotate-45 border-emerald-500/30 bg-slate-950 ${
                    position.placement === 'top'
                      ? 'bottom-[-5px] border-b border-r'
                      : 'top-[-5px] border-t border-l'
                  }`}
                  style={{
                    left:
                      align === 'center'
                        ? '50%'
                        : align === 'start'
                        ? '14px'
                        : 'calc(100% - 22px)',
                    transform: 'translateX(-50%) rotate(45deg)',
                  }}
                  aria-hidden
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
