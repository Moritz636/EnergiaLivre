// ============================================================
// _utils/format — helpers puros para /comissoes
// ============================================================

/** Formata número como BRL com 2 casas decimais. */
export function formatBRLDecimal(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0,00'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Data ISO -> "12/03/2025" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

/** Nome do mês em pt-BR (1-12). */
export function monthName(month: number): string {
  return new Date(2024, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
}
