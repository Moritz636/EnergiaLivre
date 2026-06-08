'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins, Wallet, ArrowRight, Loader2, ExternalLink, Shield,
  TrendingUp, TrendingDown, Calendar, FileText, Copy, Check, AlertCircle,
  Sparkles, Send, Flame, Zap, Gift, Award
} from 'lucide-react';
import { KWATT_SYMBOL, KWATT_UNIT_PRICE, getCurrentRatio } from '@/lib/tokenomics';

interface Holding {
  balance: number
  balance_locked: number
  balance_available: number
  lifetime_earned: number
  lifetime_burned: number
  wallet_address: string | null
  last_synced_at: string | null
}

interface TokenTx {
  id: string
  tx_type: string
  direction: 'in' | 'out' | 'self'
  amount: number
  purpose: string | null
  status: string
  tx_hash: string | null
  counterparty_wallet: string | null
  metadata: any
  created_at: string
  confirmed_at: string | null
}

interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  isDeployed: boolean
  network: string
  chainId: number
  paused: boolean
}

export default function TokenDashboardPage() {
  const [holding, setHolding] = useState<Holding | null>(null)
  const [transactions, setTransactions] = useState<TokenTx[]>([])
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeemOpen, setRedeemOpen] = useState(false)
  const [redeemType, setRedeemType] = useState<'invoice_payment' | 'donation'>('invoice_payment')
  const [redeemAmount, setRedeemAmount] = useState('')
  const [redeemSubmitting, setRedeemSubmitting] = useState(false)
  const [redeemMessage, setRedeemMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [walletInput, setWalletInput] = useState('')
  const [walletSaving, setWalletSaving] = useState(false)
  const [walletMessage, setWalletMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    void loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [balanceRes, txRes, infoRes] = await Promise.all([
        fetch('/api/token/balance', { cache: 'no-store' }),
        fetch('/api/token/transactions?limit=50', { cache: 'no-store' }),
        fetch('/api/token/info', { cache: 'no-store' }),
      ])

      if (balanceRes.ok) {
        const b = await balanceRes.json()
        setHolding(b.holding)
        if (b.holding?.wallet_address) setWalletInput(b.holding.wallet_address)
      }
      if (txRes.ok) {
        const t = await txRes.json()
        setTransactions(t.transactions || [])
      }
      if (infoRes.ok) {
        const i = await infoRes.json()
        setTokenInfo(i)
      }
    } catch (e) {
      console.error('loadAll error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function saveWallet() {
    setWalletSaving(true)
    setWalletMessage(null)
    try {
      const res = await fetch('/api/token/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletInput }),
      })
      const body = await res.json()
      if (!res.ok) {
        setWalletMessage({ type: 'err', text: body.error || 'Erro ao salvar carteira.' })
      } else {
        setWalletMessage({ type: 'ok', text: body.message || 'Carteira salva.' })
        void loadAll()
      }
    } catch (e: any) {
      setWalletMessage({ type: 'err', text: e?.message || 'Erro de rede.' })
    } finally {
      setWalletSaving(false)
    }
  }

  async function submitRedeem(e: React.FormEvent) {
    e.preventDefault()
    setRedeemMessage(null)
    const amt = Number(redeemAmount)
    if (!amt || amt <= 0) {
      setRedeemMessage({ type: 'err', text: 'Informe uma quantidade valida de tokens.' })
      return
    }
    if (holding && amt > holding.balance_available) {
      setRedeemMessage({ type: 'err', text: `Saldo disponivel insuficiente (${holding.balance_available} KWATT).` })
      return
    }
    setRedeemSubmitting(true)
    try {
      const res = await fetch('/api/token/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_tokens: amt,
          redemption_type: redeemType,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setRedeemMessage({ type: 'err', text: body.error || 'Erro ao registrar resgate.' })
      } else {
        setRedeemMessage({ type: 'ok', text: body.message || 'Resgate registrado!' })
        setRedeemAmount('')
        void loadAll()
      }
    } catch (e: any) {
      setRedeemMessage({ type: 'err', text: e?.message || 'Erro de rede.' })
    } finally {
      setRedeemSubmitting(false)
    }
  }

  const copyAddress = async () => {
    if (!tokenInfo?.address || tokenInfo.address === '0x0000000000000000000000000000000000000000') return
    try {
      await navigator.clipboard.writeText(tokenInfo.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {/* ignore */}
  }

  if (loading && !holding && !tokenInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    )
  }

  const balance = holding?.balance ?? 0
  const balanceAvailable = holding?.balance_available ?? 0
  const balanceLocked = holding?.balance_locked ?? 0
  const lifetimeEarned = holding?.lifetime_earned ?? 0
  const lifetimeBurned = holding?.lifetime_burned ?? 0
  const brlValue = balance * KWATT_UNIT_PRICE
  const kwhEquivalent = balance / getCurrentRatio()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white">Minha Carteira KWATT</h1>
          </div>
          <p className="text-sm text-slate-400">
            Seu saldo de tokens utilitários. Use para pagar faturas, cashback e serviços da plataforma.
          </p>
        </header>

        {!tokenInfo?.isDeployed && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-amber-100 font-bold mb-1">Token ainda não implantado em mainnet</p>
              <p className="text-amber-200/80 text-xs">
                O lançamento oficial está marcado para <strong>05/01/2027</strong>. Até lá, os saldos mostrados aqui são uma previsão baseada no seu historico de pre-registros e cashback.
              </p>
            </div>
          </div>
        )}

        {/* Hero card: saldo */}
        <section className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 to-yellow-500/5 border border-amber-500/30">
            <p className="text-[10px] text-amber-300 uppercase font-black tracking-wider mb-1">Saldo disponivel</p>
            <p className="text-4xl font-black text-white tabular-nums">
              {balanceAvailable.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
              <span className="text-base text-amber-400 ml-2">{KWATT_SYMBOL}</span>
            </p>
            <p className="text-sm text-amber-200/80 mt-1">
              ≈ R$ {brlValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · {kwhEquivalent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kWh
            </p>
            {balanceLocked > 0 && (
              <p className="text-xs text-amber-300/60 mt-2">
                + {balanceLocked.toLocaleString('pt-BR')} KWATT bloqueados em resgates pendentes
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setRedeemOpen(true)}
                disabled={balanceAvailable <= 0}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Flame className="w-4 h-4" /> Resgatar tokens
              </button>
              <Link
                href="/token"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Comprar mais
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Vida utilitaria</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total acumulado</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{lifetimeEarned.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total queimado</span>
              <span className="text-sm font-bold text-orange-400 flex items-center gap-1">
                <Flame className="w-3 h-3" /> -{lifetimeBurned.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Transacoes</span>
              <span className="text-sm font-bold text-white">{transactions.length}</span>
            </div>
            {holding?.last_synced_at && (
              <p className="text-[10px] text-slate-500 mt-2">
                Sync: {new Date(holding.last_synced_at).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </section>

        {/* Wallet config */}
        <section className="mb-6 p-5 rounded-2xl bg-slate-900 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Sua carteira de recebimento</h2>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Endereço EVM (Polygon) onde você receberá os tokens no lançamento (05/01/2027). Use MetaMask, Rabby, Trust Wallet, etc.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={saveWallet}
              disabled={walletSaving || !walletInput}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {walletSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {walletSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
          {walletMessage && (
            <p className={`text-xs mt-2 ${walletMessage.type === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>
              {walletMessage.text}
            </p>
          )}
        </section>

        {/* On-chain info */}
        {tokenInfo && (
          <section className="mb-6 p-5 rounded-2xl bg-slate-900 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Informacoes on-chain</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500 mb-0.5">Contrato</p>
                <div className="flex items-center gap-1">
                  <code className="text-amber-300 font-mono break-all">{tokenInfo.address}</code>
                  {tokenInfo.address !== '0x0000000000000000000000000000000000000000' && (
                    <button onClick={copyAddress} className="p-1 rounded hover:bg-white/10 shrink-0" aria-label="Copiar">
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Network</p>
                <p className="text-white">{tokenInfo.network} (chain {tokenInfo.chainId})</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Simbolo / Decimais</p>
                <p className="text-white">{tokenInfo.symbol} · {tokenInfo.decimals}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Total supply (on-chain)</p>
                <p className="text-white tabular-nums">
                  {Number(tokenInfo.totalSupply).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} {KWATT_SYMBOL}
                </p>
              </div>
            </div>
            {tokenInfo.address !== '0x0000000000000000000000000000000000000000' && (
              <a
                href={`https://polygonscan.com/token/${tokenInfo.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                Ver no Polygonscan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </section>
        )}

        {/* Historico */}
        <section className="p-5 rounded-2xl bg-slate-900 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" /> Historico de transacoes
            </h2>
            <span className="text-[10px] text-slate-500">{transactions.length} registros</span>
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Nenhuma transacao ainda. Comprar tokens, ganhar cashback ou receber referral.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((tx) => (
                <TxRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal de resgate */}
      {redeemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Resgatar tokens</h2>
              <button onClick={() => setRedeemOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={submitRedeem} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Tipo de resgate</label>
                <select
                  value={redeemType}
                  onChange={(e) => setRedeemType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white"
                >
                  <option value="invoice_payment">Pagar fatura de energia</option>
                  <option value="donation">Doação</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Quantidade (KWATT) — max {balanceAvailable.toLocaleString('pt-BR')}
                </label>
                <input
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  min="1"
                  max={balanceAvailable}
                  step="0.01"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white"
                />
                {redeemAmount && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    ≈ R$ {(Number(redeemAmount) * KWATT_UNIT_PRICE).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    {' · '}
                    {(Number(redeemAmount) / getCurrentRatio()).toFixed(2)} kWh
                  </p>
                )}
              </div>

              {redeemMessage && (
                <div className={`p-3 rounded-lg text-xs ${
                  redeemMessage.type === 'ok'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                    : 'bg-red-500/10 border border-red-500/30 text-red-200'
                }`}>
                  {redeemMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={redeemSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-900 font-black transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {redeemSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                {redeemSubmitting ? 'Processando...' : 'Confirmar resgate'}
              </button>
              <p className="text-[10px] text-slate-500 text-center">
                Resgates entram em fila de aprovacao. Processamento: ate 24h.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TxRow({ tx }: { tx: TokenTx }) {
  const isIn = tx.direction === 'in'
  const date = new Date(tx.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  const typeLabel = getTypeLabel(tx.tx_type, tx.purpose)

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-white/5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isIn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'
      }`}>
        {isIn ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{typeLabel}</p>
        <p className="text-[10px] text-slate-500">{date} · {tx.status}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold tabular-nums ${isIn ? 'text-emerald-400' : 'text-orange-400'}`}>
          {isIn ? '+' : '-'}{tx.amount.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
        </p>
        <p className="text-[9px] text-slate-500">{KWATT_SYMBOL}</p>
      </div>
    </div>
  )
}

function getTypeLabel(type: string, purpose: string | null): string {
  const map: Record<string, string> = {
    mint: 'Mint (recebido)',
    burn: 'Queima (resgate)',
    transfer: 'Transferencia',
    redeem: `Resgate — ${purpose || 'utilidade'}`,
    cashback: 'Cashback recebido',
    referral: 'Bonus de indicacao',
    reward: 'Recompensa da plataforma',
    presale: 'Pre-venda',
  }
  return map[type] || type
}
