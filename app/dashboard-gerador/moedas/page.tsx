'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import {
  Coins,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import type { CoinPackage, CoinTransactionType } from '@/lib/coins/types';

interface Wallet {
  balance: number;
  lifetime_bought: number;
  lifetime_spent: number;
  lifetime_refunded: number;
}

interface Transaction {
  id: number;
  type: CoinTransactionType;
  amount: number;
  balance_after: number;
  reason: string;
  related_entity_type: string | null;
  coin_package_id: number | null;
  created_at: string;
}

const TRANSACTION_LABELS: Record<CoinTransactionType, string> = {
  purchase: 'Compra de pacote',
  consume: 'Consumo de plataforma',
  refund: 'Reembolso',
  bonus: 'Bônus',
  admin_adjust: 'Ajuste administrativo',
};

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatCoins(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function MoedasPage() {
  return (
    <Suspense fallback={<MoedasLoading />}>
      <MoedasPageContent />
    </Suspense>
  );
}

function MoedasLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
  );
}

function MoedasPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingCode, setBuyingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<
    { kind: 'success' | 'canceled'; msg: string } | null
  >(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pkgRes, balRes, histRes] = await Promise.all([
        fetch('/api/coins/packages'),
        fetch('/api/coins/balance'),
        fetch('/api/coins/history?limit=20'),
      ]);

      if (!pkgRes.ok || !balRes.ok || !histRes.ok) {
        throw new Error('Falha ao carregar dados do servidor');
      }

      const pkgData = await pkgRes.json();
      const balData = await balRes.json();
      const histData = await histRes.json();

      setPackages(pkgData.packages ?? []);
      setWallet(balData);
      setHistory(histData.transactions ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login?next=/dashboard-gerador/moedas');
      return;
    }
    loadAll();
  }, [authLoading, user, router, loadAll]);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success === '1') {
      setBanner({
        kind: 'success',
        msg: 'Pagamento confirmado. Suas moedas serão creditadas em instantes.',
      });
      // Re-fetch após pequeno delay pra dar tempo do webhook chegar
      setTimeout(loadAll, 2500);
      setTimeout(loadAll, 6000);
    } else if (canceled === '1') {
      setBanner({ kind: 'canceled', msg: 'Compra cancelada. Nenhuma cobrança foi feita.' });
    }
  }, [searchParams, loadAll]);

  async function handleBuy(packageCode: string) {
    setBuyingCode(packageCode);
    setError(null);
    try {
      const r = await fetch('/api/coins/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageCode }),
      });
      const data = await r.json();
      if (!r.ok || !data.url) {
        throw new Error(data.error ?? 'Erro ao iniciar compra');
      }
      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao iniciar compra');
      setBuyingCode(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
            <Coins className="w-8 h-8 text-amber-400" />
            Centro de Negociações
          </h1>
          <p className="text-slate-400">
            Compre moedas para publicar ofertas, destacar anúncios e desbloquear consumidores.
          </p>
        </header>

        {banner && (
          <div
            className={`flex items-start gap-3 p-4 rounded-lg border ${
              banner.kind === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            {banner.kind === 'success' ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm">{banner.msg}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {wallet && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 text-sm font-medium">Saldo atual</span>
                <Coins className="w-5 h-5 text-amber-300" />
              </div>
              <p className="mt-3 text-3xl font-bold text-amber-100">
                {formatCoins(wallet.balance)}
              </p>
              <p className="text-xs text-amber-300/70 mt-1">moedas disponíveis</p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Total comprado</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-bold">
                {formatCoins(wallet.lifetime_bought)}
              </p>
              <p className="text-xs text-slate-500 mt-1">moedas no histórico</p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Total consumido</span>
                <TrendingDown className="w-5 h-5 text-rose-400" />
              </div>
              <p className="mt-3 text-3xl font-bold">
                {formatCoins(wallet.lifetime_spent)}
              </p>
              <p className="text-xs text-slate-500 mt-1">usadas na plataforma</p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Reembolsos</span>
                <Receipt className="w-5 h-5 text-sky-400" />
              </div>
              <p className="mt-3 text-3xl font-bold">
                {formatCoins(wallet.lifetime_refunded)}
              </p>
              <p className="text-xs text-slate-500 mt-1">moedas devolvidas</p>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Pacotes de moedas
          </h2>
          {packages.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum pacote disponível no momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => {
                const perCoinBRL = pkg.price_cents / pkg.coins / 100;
                const isBestValue = pkg.coins >= 3000;
                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl border p-5 flex flex-col ${
                      isBestValue
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-slate-700 bg-slate-900/60'
                    }`}
                  >
                    {isBestValue && (
                      <span className="absolute -top-2 right-4 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-emerald-950">
                        Melhor custo
                      </span>
                    )}
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-xs text-slate-400 mt-1 min-h-[2.5em]">
                        {pkg.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-amber-300">
                        {formatCoins(pkg.coins)}
                      </span>
                      <span className="text-xs text-slate-500">moedas</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      ≈ {formatBRL(pkg.price_cents)} · {perCoinBRL.toFixed(2)}/moeda
                    </div>
                    <button
                      onClick={() => handleBuy(pkg.code)}
                      disabled={buyingCode !== null}
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-emerald-950 font-semibold py-2.5 transition-colors"
                    >
                      {buyingCode === pkg.code ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Redirecionando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Comprar
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-sky-400" />
            Histórico de transações
          </h2>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 overflow-hidden">
            {history.length === 0 ? (
              <p className="p-6 text-center text-slate-500 text-sm">
                Nenhuma transação ainda. Compre um pacote para começar.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="text-left px-4 py-3">Data</th>
                      <th className="text-left px-4 py-3">Tipo</th>
                      <th className="text-right px-4 py-3">Quantidade</th>
                      <th className="text-right px-4 py-3">Saldo após</th>
                      <th className="text-left px-4 py-3">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {history.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              tx.type === 'purchase' || tx.type === 'refund' || tx.type === 'bonus'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : tx.type === 'consume'
                                ? 'bg-rose-500/15 text-rose-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {TRANSACTION_LABELS[tx.type] ?? tx.type}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono font-semibold ${
                            tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {formatCoins(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400 font-mono">
                          {formatCoins(tx.balance_after)}
                        </td>
                        <td className="px-4 py-3 text-slate-300 max-w-xs truncate">
                          {tx.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
