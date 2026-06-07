// ============================================================
// _utils/format — helpers puros para /dashboard-consumidor
// ============================================================

/** Formata número grande com separador pt-BR. */
export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR')
}

/** Formata BRL com 2 casas decimais. */
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

/** Pluralização simples. */
export function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : pluralForm ?? `${singular}s`
}
