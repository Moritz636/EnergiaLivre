'use client';
import { useState } from 'react';
import { Loader2, MapPin, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { getCurrentPosition, geocodeCidadeUF, isValidCoordinate } from '@/lib/geolocation';

type LocationState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; lat: number; lng: number; source: 'gps' | 'geocode'; cidade?: string; estado?: string }
  | { kind: 'error'; message: string };

type SupabaseLike = {
  from: (table: string) => any
}

type Props = {
  supabase: SupabaseLike
  userId: string
  onSaved?: (lat: number, lng: number) => void
  initialCidade?: string
  initialEstado?: string
}

export default function LocationCapture({ supabase, userId, onSaved, initialCidade = '', initialEstado = '' }: Props) {
  const [state, setState] = useState<LocationState>({ kind: 'idle' });
  const [cidade, setCidade] = useState(initialCidade);
  const [estado, setEstado] = useState(initialEstado);
  const [saving, setSaving] = useState(false);

  const captureGPS = async () => {
    setState({ kind: 'loading' });
    try {
      const pos = await getCurrentPosition({ timeoutMs: 10_000 });
      const { lat, lng } = pos;
      if (!isValidCoordinate(lat, lng)) {
        setState({ kind: 'error', message: 'Coordenada inválida retornada pelo navegador.' });
        return;
      }
      await persist(lat, lng, 'gps');
    } catch (err: any) {
      setState({
        kind: 'error',
        message: err?.message || 'Não foi possível obter sua localização. Tente a busca manual.',
      });
    }
  };

  const searchManual = async () => {
    if (!cidade.trim() || !estado.trim()) {
      setState({ kind: 'error', message: 'Preencha cidade e estado.' });
      return;
    }
    setState({ kind: 'loading' });
    try {
      const result = await geocodeCidadeUF(cidade, estado);
      if (!result) {
        setState({
          kind: 'error',
          message: `Não encontramos "${cidade}, ${estado}". Tente outra grafia.`,
        });
        return;
      }
      await persist(result.lat, result.lng, 'geocode', result.cidade, result.estado);
    } catch (err: any) {
      setState({
        kind: 'error',
        message: err?.message || 'Erro ao buscar coordenadas.',
      });
    }
  };

  const persist = async (
    lat: number,
    lng: number,
    source: 'gps' | 'geocode',
    cidadeRes?: string,
    estadoRes?: string
  ) => {
    setSaving(true);
    try {
      const cidadeFinal = cidadeRes || cidade;
      const estadoFinal = estadoRes || estado;

      const sb: any = supabase
      await sb.from('user_locations').upsert(
        {
          user_id: userId,
          latitude: lat,
          longitude: lng,
          cidade: cidadeFinal,
          estado: estadoFinal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      setState({ kind: 'success', lat, lng, source, cidade: cidadeFinal, estado: estadoFinal });
      onSaved?.(lat, lng);
    } catch (err: any) {
      setState({
        kind: 'error',
        message: err?.message || 'Erro ao salvar localização.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">Sua localização</h3>
      </div>

      {state.kind === 'success' ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-300 text-sm font-bold">Localização salva</p>
          </div>
          <p className="text-slate-300 text-xs">
            {state.cidade && state.estado ? `${state.cidade}, ${state.estado} • ` : ''}
            {state.lat.toFixed(4)}, {state.lng.toFixed(4)}
            {' • '}
            {state.source === 'gps' ? 'GPS' : 'busca manual'}
          </p>
          <button
            onClick={() => setState({ kind: 'idle' })}
            className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 underline"
          >
            Atualizar
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={captureGPS}
            disabled={state.kind === 'loading' || saving}
            className="w-full mb-3 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {state.kind === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <MapPin className="w-5 h-5" /> Usar minha localização atual
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
            />
            <input
              type="text"
              placeholder="UF"
              maxLength={2}
              value={estado}
              onChange={(e) => setEstado(e.target.value.toUpperCase())}
              className="w-16 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 text-center uppercase"
            />
            <button
              onClick={searchManual}
              disabled={state.kind === 'loading' || saving}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition disabled:opacity-50"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {state.kind === 'error' && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-xs">{state.message}</p>
        </div>
      )}
    </div>
  );
}
