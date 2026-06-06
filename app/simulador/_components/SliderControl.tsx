'use client'

// ============================================================
// SliderControl — Slider premium com feedback tátil e visual
// ------------------------------------------------------------
// - Track com gradiente dinâmico (esquerda = economia, direita = gasto).
// - Ticks visuais clicáveis nos valores-chave (100, 500, 1k, 1.5k, 2k).
// - Input numérico sincronizado, com sufixo "R$" e edição direta.
// - Acessibilidade: role=slider, aria-valuemin/max/now/text,
//   navegação por teclado (setas, Home, End, PageUp/Down).
// - Micro-confirmação visual (flash + check) ao soltar o slider.
// - Snap suave a tick quando o usuário libera a menos de 1.5% de distância.
// - Respeita prefers-reduced-motion via globals.css.
// ============================================================

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'
import { Check, Minus, Plus } from 'lucide-react'
import { formatBRL } from '../_utils/format'

const MIN = 50
const MAX = 2000
const STEP = 10

const TICK_VALUES = [100, 500, 1000, 1500, 2000] as const
const SNAP_THRESHOLD_PCT = 1.5

export interface SliderControlProps {
  value: number
  onChange: (value: number) => void
  /** Label de seção exibido acima (ex.: "Sua conta de luz atual") */
  label?: string
  /** Texto auxiliar abaixo do label */
  hint?: string
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function snapToTick(value: number): number {
  const range = MAX - MIN
  for (const tick of TICK_VALUES) {
    if (Math.abs((value - tick) / range) * 100 <= SNAP_THRESHOLD_PCT) {
      return tick
    }
  }
  return value
}

export default function SliderControl({
  value,
  onChange,
  label = 'Sua conta de luz atual',
  hint = 'Arraste ou digite o valor da fatura mensal',
}: SliderControlProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [pulseValue, setPulseValue] = useState(false)
  const [inputDraft, setInputDraft] = useState<string>(String(value))
  const inputRef = useRef<HTMLInputElement | null>(null)
  const rangeRef = useRef<HTMLInputElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const id = useId()

  // Sincroniza o input draft com o value externo (apenas quando termina de digitar)
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputDraft(String(value))
    }
  }, [value])

  // Confirmação visual: dispara "check" por 1.2s após soltar o slider
  useEffect(() => {
    if (!isDragging) {
      setConfirmed(true)
      const t = setTimeout(() => setConfirmed(false), 1200)
      return () => clearTimeout(t)
    }
    return
  }, [isDragging])

  // Pulse no valor numérico ao alterar
  useEffect(() => {
    setPulseValue(true)
    const t = setTimeout(() => setPulseValue(false), 320)
    return () => clearTimeout(t)
  }, [value])

  const handleRangeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = clamp(Number(e.target.value), MIN, MAX)
      onChange(next)
    },
    [onChange],
  )

  const handleRangeRelease = useCallback(() => {
    setIsDragging(false)
    onChange(snapToTick(value))
  }, [onChange, value])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      let next = value
      const big = e.shiftKey ? 100 : STEP * 5
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = clamp(value + (e.shiftKey ? big : STEP), MIN, MAX)
          break
        case 'ArrowLeft':
        case 'ArrowDown':
          next = clamp(value - (e.shiftKey ? big : STEP), MIN, MAX)
          break
        case 'PageUp':
          next = clamp(value + big, MIN, MAX)
          break
        case 'PageDown':
          next = clamp(value - big, MIN, MAX)
          break
        case 'Home':
          next = MIN
          break
        case 'End':
          next = MAX
          break
        default:
          return
      }
      e.preventDefault()
      onChange(next)
    },
    [onChange, value],
  )

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 4)
    setInputDraft(raw)
    if (raw === '') return
    const n = Number(raw)
    if (!Number.isFinite(n)) return
    onChange(clamp(n, MIN, MAX))
  }

  const commitInput = () => {
    const n = Number(inputDraft)
    if (!Number.isFinite(n) || inputDraft === '') {
      setInputDraft(String(value))
      return
    }
    const clamped = clamp(n, MIN, MAX)
    onChange(snapToTick(clamped))
    setInputDraft(String(clamped))
  }

  const adjust = (delta: number) => {
    onChange(clamp(value + delta, MIN, MAX))
  }

  // Progresso 0..1 (usado para o gradiente do track)
  const progress = ((value - MIN) / (MAX - MIN)) * 100

  return (
    <div className="space-y-4">
      {/* Header com label + input numérico */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
          <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão − */}
          <button
            type="button"
            onClick={() => adjust(-STEP)}
            aria-label="Diminuir valor"
            className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition flex items-center justify-center"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Input numérico prefixado com R$ */}
          <div
            className={`relative flex items-center h-11 px-4 rounded-full border transition-all duration-300 ${
              confirmed
                ? 'border-emerald-500/60 bg-emerald-500/5 shadow-glow-emerald'
                : 'border-white/10 bg-slate-900/60 hover:border-white/20 focus-within:border-emerald-500/50 focus-within:bg-slate-900/80'
            }`}
          >
            <span className="text-slate-400 text-base font-medium mr-1 select-none">
              R$
            </span>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={inputDraft}
              onChange={handleInputChange}
              onBlur={commitInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitInput()
                  inputRef.current?.blur()
                }
              }}
              aria-label="Valor da conta em reais"
              className="w-20 bg-transparent outline-none text-white font-bold text-lg tabular-nums text-right"
            />
            {confirmed && (
              <span
                className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-950 animate-check-pop"
                aria-hidden
              >
                <Check className="w-3 h-3" strokeWidth={3} />
              </span>
            )}
          </div>

          {/* Botão + */}
          <button
            type="button"
            onClick={() => adjust(STEP)}
            aria-label="Aumentar valor"
            className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="relative pt-2 pb-8" ref={trackRef}>
        {/* Track (fundo cinza) */}
        <div className="absolute top-[10px] left-0 right-0 h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
          {/* Preenchimento (gradiente emerald) */}
          <div
            className="h-full rounded-full transition-[width] duration-200 ease-out"
            style={{
              width: `${progress}%`,
              background:
                'linear-gradient(90deg, #10b981 0%, #34d399 60%, #6ee7b7 100%)',
              boxShadow: '0 0 14px rgba(16, 185, 129, 0.45)',
            }}
          />
          {/* Shimmer sutil durante o drag */}
          {isDragging && (
            <div
              className="absolute inset-0 animate-shimmer"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
            />
          )}
        </div>

        {/* Input range real (invisível, full-size) */}
        <input
          ref={rangeRef}
          id={id}
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={value}
          onChange={handleRangeChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={handleRangeRelease}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={handleRangeRelease}
          onKeyDown={handleKeyDown}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={handleRangeRelease}
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={value}
          aria-valuetext={`R$ ${value.toLocaleString('pt-BR')}`}
          aria-label="Valor da conta de luz"
          className="el-slider relative w-full h-6 z-10"
        />

        {/* Ticks clicáveis */}
        <div className="absolute top-[14px] left-0 right-0 flex justify-between pointer-events-none px-[2px]">
          {[MIN, ...TICK_VALUES].map((tick) => {
            const isActive = value === tick
            const tickProgress = ((tick - MIN) / (MAX - MIN)) * 100
            return (
              <button
                key={tick}
                type="button"
                onClick={() => {
                  onChange(tick)
                  rangeRef.current?.focus()
                }}
                aria-label={`Definir valor como ${formatBRL(tick)}`}
                className="group pointer-events-auto -translate-x-1/2 flex flex-col items-center"
                style={{ position: 'absolute', left: `${tickProgress}%` }}
              >
                <span
                  className={`block rounded-full transition-all duration-200 ${
                    isActive
                      ? 'w-3 h-3 bg-emerald-400 shadow-glow-emerald'
                      : 'w-2 h-2 bg-slate-600 group-hover:bg-emerald-400 group-hover:scale-125'
                  }`}
                />
                <span
                  className={`mt-2 text-[10px] tabular-nums font-medium transition-colors ${
                    isActive
                      ? 'text-emerald-400'
                      : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {tick >= 1000 ? `${tick / 1000}k` : tick}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Valor grande com pulse */}
      <div className="flex items-baseline gap-2 -mt-2">
        <span
          className={`text-4xl md:text-5xl font-black tabular-nums text-white ${
            pulseValue ? 'animate-value-bump' : ''
          }`}
        >
          R$ {value.toLocaleString('pt-BR')}
        </span>
        <span className="text-sm text-slate-500 font-medium">/mês</span>
      </div>
    </div>
  )
}
