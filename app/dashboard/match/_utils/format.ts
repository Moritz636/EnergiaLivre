// ============================================================
// _utils/format — helpers puros para a tela /dashboard/match
// ============================================================

/** Escapa string para uso seguro em HTML (popups de mapa). */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/** Formata coordenada com 3 casas decimais. */
export function formatCoord(value: number): string {
  return value.toFixed(3)
}

/** Formata distância em km com 0 casas (ex: "12 km"). */
export function formatDistance(km: number | null | undefined): string {
  if (km == null) return ''
  return `${km.toFixed(0)} km`
}

/** Pluralização simples (1 candidato / 2 candidatos). */
export function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : pluralForm ?? `${singular}s`
}
