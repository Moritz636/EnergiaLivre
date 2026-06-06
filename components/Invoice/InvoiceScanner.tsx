'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Loader2, CheckCircle2, AlertCircle, X, RotateCw, Zap, ScanLine } from 'lucide-react';

type ScannerProps = {
  onScan: (payload: string) => void | Promise<void>;
  onClose?: () => void;
  /** FPS da câmera (1-30) */
  fps?: number;
  /** Tipos de barcode/QR suportados */
  formats?: Array<'qr_code' | 'code_128' | 'code_39' | 'code_93' | 'codabar' | 'data_matrix' | 'ean_13' | 'ean_8' | 'itf' | 'pdf417' | 'upc_a' | 'upc_e'>;
}

type ScannerState = 'idle' | 'requesting' | 'scanning' | 'processing' | 'denied' | 'error' | 'unsupported';

const DEFAULT_FORMATS = ['qr_code', 'code_128', 'code_39', 'ean_13', 'itf', 'pdf417'] as const;

export default function InvoiceScanner({ onScan, onClose, fps = 10, formats = [...DEFAULT_FORMATS] }: ScannerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<any>(null);
  const lastScanRef = useRef<{ payload: string; ts: number } | null>(null);
  const [state, setState] = useState<ScannerState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCode, setManualCode] = useState('');

  const stop = useCallback(async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop?.()
        await scannerRef.current.clear?.()
      }
    } catch {
      // ignore
    }
  }, [])

  const start = useCallback(async () => {
    if (typeof window === 'undefined') return
    setState('requesting')
    setErrorMsg('')

    // Carrega o html5-qrcode dinamicamente (client-side only)
    const mod: any = await import('html5-qrcode')
    const Html5Qrcode = mod.Html5Qrcode
    if (!Html5Qrcode) {
      setState('unsupported')
      setErrorMsg('Biblioteca de scanner não disponível.')
      return
    }

    // Verifica se o navegador tem suporte
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported')
      setErrorMsg('Seu navegador não suporta acesso à câmera.')
      return
    }

    if (!containerRef.current) return

    const scannerId = 'invoice-scanner-region'
    if (!document.getElementById(scannerId)) {
      const div = document.createElement('div')
      div.id = scannerId
      containerRef.current.appendChild(div)
    }

    const scanner = new Html5Qrcode(scannerId, /* verbose */ false)
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps, qrbox: { width: 280, height: 160 }, aspectRatio: 1.7777 },
        (decodedText: string) => {
          // Deduplicação: ignora o mesmo código em < 2 segundos
          const now = Date.now()
          if (lastScanRef.current && lastScanRef.current.payload === decodedText && now - lastScanRef.current.ts < 2000) {
            return
          }
          lastScanRef.current = { payload: decodedText, ts: now }
          setState('processing')
          void onScan(decodedText)
        },
        () => {
          // ignore parse errors (a cada frame)
        },
      )
      setState('scanning')
    } catch (err: any) {
      const msg: string = err?.message || String(err)
      if (/permission|denied|notallowed/i.test(msg)) {
        setState('denied')
        setErrorMsg('Permissão da câmera negada. Habilite nas configurações do navegador.')
      } else {
        setState('error')
        setErrorMsg(msg || 'Erro ao iniciar câmera.')
      }
    }
  }, [fps, onScan])

  useEffect(() => {
    void start()
    return () => {
      void stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    setState('processing')
    await onScan(manualCode.trim())
  }

  return (
    <div className="relative">
      {onClose && (
        <button
          onClick={async () => { await stop(); onClose() }}
          className="absolute top-2 right-2 z-30 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
          aria-label="Fechar scanner"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Container da câmera */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-white/10"
      >
        {/* Overlay - guia de leitura */}
        {state === 'scanning' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="relative w-72 h-40">
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-emerald-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-emerald-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-emerald-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-emerald-400 rounded-br-lg" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400/60 animate-pulse" />
            </div>
          </div>
        )}

        {/* Loading inicial */}
        {state === 'requesting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
            <p className="text-sm text-slate-300">Solicitando acesso à câmera...</p>
          </div>
        )}

        {/* Erro / permissão negada */}
        {(state === 'denied' || state === 'error' || state === 'unsupported') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 z-20 p-6 text-center">
            {state === 'denied' ? (
              <CameraOff className="w-12 h-12 text-red-400 mb-3" />
            ) : state === 'unsupported' ? (
              <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            )}
            <p className="text-sm font-bold text-white mb-1">
              {state === 'denied' && 'Câmera bloqueada'}
              {state === 'unsupported' && 'Não suportado'}
              {state === 'error' && 'Erro'}
            </p>
            <p className="text-xs text-slate-400 max-w-xs">{errorMsg}</p>
            <button
              onClick={start}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
            >
              <RotateCw className="w-3 h-3" /> Tentar novamente
            </button>
          </div>
        )}

        {state === 'processing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 z-20">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="text-sm text-white font-bold">Código detectado!</p>
            <p className="text-xs text-slate-400 mt-1">Processando...</p>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-slate-300 font-bold flex items-center gap-1.5 mb-2">
          <ScanLine className="w-3.5 h-3.5" /> Sem câmera ou prefere digitar?
        </p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Cole aqui a linha digitável ou código de barras"
            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
          <button
            type="submit"
            disabled={!manualCode.trim() || state === 'processing'}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-bold disabled:opacity-50 flex items-center gap-1"
          >
            <Zap className="w-3 h-3" /> Validar
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-2">
          Suportamos linha digitável (47/48 dígitos), código de barras ITF (44 dígitos) e QR codes padrão ANEEL/PIX.
        </p>
      </div>
    </div>
  )
}
