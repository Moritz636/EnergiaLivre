// ============================================================
// _utils/format — helpers puros para /embaixador
// ============================================================

/** Formata BRL com 0 casas decimais (usado nos cards do simulador). */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}
