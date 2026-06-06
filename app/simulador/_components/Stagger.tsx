'use client'

// ============================================================
// Stagger — Container com animação de entrada em cascata
// ------------------------------------------------------------
// Aplica delay incremental (CSS) em cada child direto.
// Mantém SSR-safe: a animação só roda após o primeiro paint
// para evitar CLS.
// ============================================================

import { Children, cloneElement, isValidElement, type ReactNode } from 'react'

interface StaggerProps {
  children: ReactNode
  /** Delay base em ms */
  baseDelay?: number
  /** Incremento entre filhos em ms */
  step?: number
  /** Classe extra para o container */
  className?: string
}

export default function Stagger({
  children,
  baseDelay = 80,
  step = 90,
  className = '',
}: StaggerProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, idx) => {
        if (!isValidElement(child)) return child
        const delay = baseDelay + idx * step
        return cloneElement(child as React.ReactElement<any>, {
          style: {
            ...(child.props as any).style,
            animationDelay: `${delay}ms`,
          },
        })
      })}
    </div>
  )
}
