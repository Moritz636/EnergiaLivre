// ============================================================
// _utils/format — helpers puros para /admin/credits
// ============================================================

/** Formata BRL com 2 casas decimais. */
export function formatBRL(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0,00'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** BRL com prefixo R$. */
export function formatCurrency(value: number | string): string {
  return `R$ ${formatBRL(value)}`
}

/** Data ISO -> "12/03/2025 14:30" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
