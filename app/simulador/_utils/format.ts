// ============================================================
// _utils/format — Formatadores puros (sem React)
// ============================================================

/**
 * Formata um número como BRL (sem o símbolo).
 * Aceita Number ou string numérica.
 */
export function formatBRL(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0'
  return Math.round(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

/**
 * Formata um número como BRL com o prefixo "R$".
 */
export function formatCurrency(value: number | string): string {
  return `R$ ${formatBRL(value)}`
}

/**
 * Formata um número grande de forma curta:
 * 1500 -> "1,5k" | 1500000 -> "1,5M"
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}k`
  }
  return value.toLocaleString('pt-BR')
}
