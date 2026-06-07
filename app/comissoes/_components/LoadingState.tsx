'use client'

// ============================================================
// LoadingState — Spinner inicial
// ============================================================

export function LoadingState() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div
        className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"
        aria-label="Carregando"
      />
    </div>
  )
}
