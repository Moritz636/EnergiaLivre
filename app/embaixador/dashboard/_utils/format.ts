// ============================================================
// _utils/format — Formatadores puros (sem React) usados no
// painel do parceiro. Isolados para fácil reuso/teste.
// ============================================================

/** Formata um número como BRL (sem símbolo, pt-BR). */
export function formatBRL(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0'
  return Math.round(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

/** BRL com prefixo "R$" e 2 casas decimais (para valores monetários reais). */
export function formatBRLDecimal(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0,00'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** BRL com prefixo "R$" arredondado (para cards/destaques). */
export function formatCurrency(value: number | string): string {
  return `R$ ${formatBRL(value)}`
}

/** Data ISO -> "12/03/2025" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

/** Compacta número grande: 1500 -> "1,5k" | 1500000 -> "1,5M" */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}k`
  }
  return value.toLocaleString('pt-BR')
}

/** Pluralização simples (1 lead / 2 leads). */
export function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : pluralForm ?? `${singular}s`
}
