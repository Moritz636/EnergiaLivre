'use client'

// ============================================================
// EnergyBackground — Atmosfera sutil para a página /simulador
// ------------------------------------------------------------
// Combina uma grade técnica de baixa opacidade com halos
// radiais (cyan/emerald) e duas ondas SVG animadas para dar
// profundidade ao fundo #020617 sem distrair do conteúdo.
// ============================================================

import type { CSSProperties } from 'react'

export default function EnergyBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Camada 1 — grade + halos radiais (CSS) */}
      <div className="absolute inset-0 bg-energy-grid opacity-90" />

      {/* Camada 2 — onda inferior (gradiente blur) */}
      <div
        className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[1200px] h-[420px] rounded-[100%] opacity-30 blur-3xl animate-energy-pulse"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(16,185,129,0.35) 0%, rgba(16,185,129,0) 70%)',
        }}
      />

      {/* Camada 3 — feixe diagonal de luz cyan */}
      <div
        className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl animate-energy-pulse"
        style={{
          animationDelay: '2s',
          background:
            'radial-gradient(circle, rgba(34,211,238,0.45) 0%, rgba(34,211,238,0) 70%)',
        }}
      />

      {/* Camada 4 — onda SVG (linha de energia) */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[280px] opacity-30"
        viewBox="0 0 1440 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ '--anim-dur': '16s' } as CSSProperties}
      >
        <defs>
          <linearGradient id="energy-wave-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="energy-wave-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 180 C 240 100 480 260 720 180 S 1200 100 1440 200 L 1440 280 L 0 280 Z"
          fill="url(#energy-wave-1)"
          opacity="0.4"
        />
        <path
          d="M0 220 C 240 160 480 280 720 220 S 1200 140 1440 240 L 1440 280 L 0 280 Z"
          fill="url(#energy-wave-2)"
          opacity="0.3"
        />
      </svg>

      {/* Camada 5 — vinheta nas bordas (foco central) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 30%, transparent 30%, rgba(2,6,23,0.6) 100%)',
        }}
      />
    </div>
  )
}
