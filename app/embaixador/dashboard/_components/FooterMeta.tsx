'use client'

// ============================================================
// FooterMeta — Rodapé com data de adesão e total de leads.
// ============================================================

import { Calendar, Award } from 'lucide-react'
import { formatDate, plural } from '../_utils/format'

interface FooterMetaProps {
  createdAt: string | null
  leadsCount: number
}

export function FooterMeta({ createdAt, leadsCount }: FooterMetaProps) {
  if (!createdAt) return null

  return (
    <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
      <Calendar className="w-3 h-3" aria-hidden />
      <span>Parceiro desde {formatDate(createdAt)}</span>
      {leadsCount > 0 && (
        <>
          <span aria-hidden>•</span>
          <Award className="w-3 h-3" aria-hidden />
          <span>
            {leadsCount} {plural(leadsCount, 'lead')} capturado{leadsCount === 1 ? '' : 's'}
          </span>
        </>
      )}
    </div>
  )
}
