'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins, Wallet, ArrowRight, Loader2, ExternalLink, Shield,
  TrendingUp, TrendingDown, Calendar, FileText, Copy, Check, AlertCircle,
  Sparkles, Send, Flame, Zap, Gift, Award, QrCode,
  CreditCard, Banknote, X, Clock, Users, BarChart3, Target,
  Rocket, Crown, ShoppingBag, Eye, Info,
} from 'lucide-react';
import {
  KWATT_SYMBOL, KWATT_UNIT_PRICE, getCurrentRatio, getCurrentUnitPrice,
  KWATT_MONTHLY_GROWTH, getFinalPrice, TOKEN_PACKAGES, formatBRL, formatTokens,
} from '@/lib/tokenomics';
import { WHATSAPP_BASE } from '@/lib/leads';

type Gateway = 'stripe' | 'pagseguro'
type PsMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD'

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

const PRESALE_END = new Date('2027-01-25T00:00:00')

export default function TokenDashboardPage() {
  const [holding, setHolding] = useState<Holding | null>(null)
  const [transactions, setTransactions] = useState<TokenTx[]>([])
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [metrics, setMetrics] = useState<{ total_pre_registrations: number; total_redeems: number } | null>(null)
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
  const [countdown, setCountdown] = useState('')
  const [showBuy, setShowBuy] = useState(false)
  const [buyPkg, setBuyPkg] = useState<typeof TOKEN_PACKAGES[number]>(TOKEN_PACKAGES[2])
  const [gateway, setGateway] = useState<Gateway>('stripe')
  const [psMethod, setPsMethod] = useState<PsMethod>('PIX')
  const [psModal, setPsModal] = useState(false)
  const [psResult, setPsResult] = useState<any>(null)
  const [psLoading, setPsLoading] = useState(false)
  const [psError, setPsError] = useState('')
  const [pixCopied, setPixCopied] = useState(false)

  useEffect(() => {
    void loadAll()
    const interval = setInterval(updateCountdown, 1000)
    updateCountdown()
    return () => clearInterval(interval)
  }, [])

  function updateCountdown() {
    const diff = PRESALE_END.getTime() - Date.now()
    if (diff <= 0) { setCountdown('Pré-venda encerrada'); return }
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    setCountdown(`${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`)
  }

  async function loadAll() {
    setLoading(true)
    try {
      const [balanceRes, txRes, infoRes, metricsRes] = await Promise.all([
        fetch('/api/token/balance', { cache: 'no-store' }),
        fetch('/api/token/transactions?limit=50', { cache: 'no-store' }),
        fetch('/api/token/info', { cache: 'no-store' }),
        fetch('/api/token/metrics', { cache: 'no-store' }),
      ])
      if (balanceRes.ok) { const b = await balanceRes.json(); setHolding(b.holding); if (b.holding?.wallet_address) setWalletInput(b.holding.wallet_address) }
      if (txRes.ok) { const t = await txRes.json(); setTransactions(t.transactions || []) }
      if (infoRes.ok) { const i = await infoRes.json(); setTokenInfo(i) }
      if (metricsRes.ok) { const m = await metricsRes.json(); setMetrics(m) }
    } catch (e) { console.error('loadAll error:', e) } finally { setLoading(false) }
  }

  async function saveWallet() {
    setWalletSaving(true); setWalletMessage(null)
    try {
      const res = await fetch('/api/token/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet_address: walletInput }) })
      const body = await res.json()
      if (!res.ok) setWalletMessage({ type: 'err', text: body.error || 'Erro ao salvar carteira.' })
      else { setWalletMessage({ type: 'ok', text: body.message || 'Carteira salva.' }); void loadAll() }
    } catch (e: any) { setWalletMessage({ type: 'err', text: e?.message || 'Erro de rede.' }) } finally { setWalletSaving(false) }
  }

  async function submitRedeem(e: React.FormEvent) {
    e.preventDefault(); setRedeemMessage(null)
    const amt = Number(redeemAmount)
    if (!amt || amt <= 0) { setRedeemMessage({ type: 'err', text: 'Informe uma quantidade válida de tokens.' }); return }
    if (holding && amt > holding.balance_available) { setRedeemMessage({ type: 'err', text: `Saldo disponível insuficiente (${holding.balance_available} KWATT).` }); return }
    setRedeemSubmitting(true)
    try {
      const res = await fetch('/api/token/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount_tokens: amt, redemption_type: redeemType }) })
      const body = await res.json()
      if (!res.ok) setRedeemMessage({ type: 'err', text: body.error || 'Erro ao registrar resgate.' })
      else { setRedeemMessage({ type: 'ok', text: body.message || 'Resgate registrado!' }); setRedeemAmount(''); void loadAll() }
    } catch (e: any) { setRedeemMessage({ type: 'err', text: e?.message || 'Erro de rede.' }) } finally { setRedeemSubmitting(false) }
  }

  async function handleBuyWithPagSeguro() {
    setPsModal(true); setPsLoading(true); setPsError('')
    try {
      const finalPrice = getFinalPrice(buyPkg)
      const res = await fetch('/api/pagseguro/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        userId: 'dashboard', type: 'token_presale', description: `KWATT ${buyPkg.code} - ${formatTokens(buyPkg.tokens)}`,
        amount: finalPrice, paymentMethod: psMethod, customerName: 'Cliente', customerEmail: 'cliente@email.com',
        referenceId: `TOKEN-${Date.now()}`,
      }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro PagSeguro')
      setPsResult(data.charge)
    } catch (err: any) { setPsError(err.message) } finally { setPsLoading(false) }
  }

  const copyAddress = async () => {
    if (!tokenInfo?.address || tokenInfo.address === '0x0000000000000000000000000000000000000000') return
    try { await navigator.clipboard.writeText(tokenInfo.address); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { }
  }

  const balance = holding?.balance ?? 0
  const balanceAvailable = holding?.balance_available ?? 0
  const balanceLocked = holding?.balance_locked ?? 0
  const lifetimeEarned = holding?.lifetime_earned ?? 0
  const lifetimeBurned = holding?.lifetime_burned ?? 0
  const currentRatio = getCurrentRatio()
  const brlValue = balance * KWATT_UNIT_PRICE
  const kwhEquivalent = balance / currentRatio
  const unitPrice = getCurrentUnitPrice()
  const nextMonthPrice = unitPrice * (1 + KWATT_MONTHLY_GROWTH)

  if (loading && !holding && !tokenInfo) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Title + Social Proof */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-6 h-6 text-amber-400" />
              <h1 className="text-2xl font-black text-white">Minha Carteira KWATT</h1>
            </div>
            <p className="text-sm text-slate-400">Token de utilidade do ecossistema EnergiaLivre</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {metrics && (
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-amber-400" /> {metrics.total_pre_registrations.toLocaleString('pt-BR')} pré-registrados</span>
            )}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" /> Pré-venda encerra em: <strong className="text-white font-mono">{countdown}</strong></span>
          </div>
        </div>

        {/* Alert if not deployed */}
        {!tokenInfo?.isDeployed && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-amber-100 font-bold mb-1">Token ainda não implantado em mainnet</p>
              <p className="text-amber-200/80 text-xs">Lançamento oficial: <strong>25/01/2027</strong>. Saldos são previsão baseada em pré-registros e cashback.</p>
            </div>
          </div>
        )}

        {/* Hero: Balance + Price Projection (Loss Aversion) */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Balance Card */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 to-yellow-500/5 border border-amber-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
            <p className="text-[10px] text-amber-300 uppercase font-black tracking-wider mb-1">Saldo disponível</p>
            <p className="text-4xl font-black text-white tabular-nums">
              {balanceAvailable.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
              <span className="text-base text-amber-400 ml-2">{KWATT_SYMBOL}</span>
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm">
              <span className="text-amber-200/80">≈ R$ {brlValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span className="text-amber-200/80">· {kwhEquivalent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kWh</span>
            </div>
            {balanceLocked > 0 && (
              <p className="text-xs text-amber-300/60 mt-2">+ {balanceLocked.toLocaleString('pt-BR')} KWATT bloqueados em resgates pendentes</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setRedeemOpen(true)} disabled={balanceAvailable <= 0}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Flame className="w-4 h-4" /> Resgatar tokens
              </button>
              <button onClick={() => setShowBuy(true)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Comprar KWATT
              </button>
            </div>
          </div>

          {/* Price Projection Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Valorização mensal</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-400">+{KWATT_MONTHLY_GROWTH * 100}%</span>
              <span className="text-xs text-slate-500">/mês</span>
            </div>
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Preço hoje</span>
                <span className="text-white font-bold">R$ {unitPrice.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Preço mês que vem</span>
                <span className="text-orange-300 font-bold">R$ {nextMonthPrice.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Economia comprando agora</span>
                <span className="text-emerald-400 font-bold">{(nextMonthPrice / unitPrice - 1) * 100 > 0 ? `+${((nextMonthPrice / unitPrice - 1) * 100).toFixed(1)}%` : '0%'}</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 italic">3% composto ao mês. Preço definido pelo algoritmo de crescimento.</p>
          </div>
        </div>

        {/* Stats Row - Scarcity & Social Proof */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Users, label: 'Pré-registrados', value: metrics?.total_pre_registrations?.toLocaleString('pt-BR') ?? '—', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: Target, label: 'Total supply', value: `${(1_000_000_000).toLocaleString('pt-BR')} KWATT`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { icon: TrendingUp, label: 'disponível pré-venda', value: `${formatTokens(TOKEN_PACKAGES.reduce((s, p) => s + p.tokens + p.bonus, 0))} KWATT`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { icon: Clock, label: 'Encerramento', value: countdown, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border border-white/5 rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</p>
              </div>
              <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Lifetime stats */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-3">Vida útil do token</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500">Total acumulado</p>
              <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +{lifetimeEarned.toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total queimado</p>
              <p className="text-lg font-bold text-orange-400 flex items-center gap-1">
                <Flame className="w-4 h-4" /> -{lifetimeBurned.toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Transações</p>
              <p className="text-lg font-bold text-white">{transactions.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Conversão atual</p>
              <p className="text-lg font-bold text-white">1 KWATT = {(currentRatio * 100).toFixed(1)}% kWh</p>
            </div>
          </div>
          {holding?.last_synced_at && <p className="text-[10px] text-slate-500 mt-3">Sync: {new Date(holding.last_synced_at).toLocaleString('pt-BR')}</p>}
        </div>

        {/* Wallet Config */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Sua carteira de recebimento</h2>
          </div>
          <p className="text-xs text-slate-400 mb-3">Endereço EVM (Polygon) para receber tokens no lançamento (25/01/2027). MetaMask, Rabby, Trust Wallet.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={walletInput} onChange={(e) => setWalletInput(e.target.value)} placeholder="0x..." className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500/50" />
            <button onClick={saveWallet} disabled={walletSaving || !walletInput} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {walletSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {walletSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
          {walletMessage && <p className={`text-xs mt-2 ${walletMessage.type === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>{walletMessage.text}</p>}
        </div>

        {/* On-chain info */}
        {tokenInfo && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Informações on-chain</h2>
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
              <div><p className="text-slate-500 mb-0.5">Network</p><p className="text-white">{tokenInfo.network} (chain {tokenInfo.chainId})</p></div>
              <div><p className="text-slate-500 mb-0.5">Símbolo / Decimais</p><p className="text-white">{tokenInfo.symbol} · {tokenInfo.decimals}</p></div>
              <div><p className="text-slate-500 mb-0.5">Total supply (on-chain)</p><p className="text-white tabular-nums">{Number(tokenInfo.totalSupply).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} {KWATT_SYMBOL}</p></div>
            </div>
            {tokenInfo.address !== '0x0000000000000000000000000000000000000000' && (
              <a href={`https://polygonscan.com/token/${tokenInfo.address}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
                Ver no Polygonscan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Transaction History */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" /> Histórico de transações
            </h2>
            <span className="text-[10px] text-slate-500">{transactions.length} registros</span>
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhuma transação ainda. Compre tokens, ganhe cashback ou indique amigos.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}
            </div>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {showBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" /> Comprar KWATT
              </h2>
              <button onClick={() => setShowBuy(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>

            {/* Scarcity banner */}
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2">
              <Eye className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-200">O preço sobe {KWATT_MONTHLY_GROWTH * 100}% ao mês</p>
                <p className="text-[10px] text-rose-300/70">Comprar hoje garante o menor preço da série histórica.</p>
              </div>
            </div>

            {/* Package selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              {TOKEN_PACKAGES.slice(0, 3).map((pkg) => {
                const fp = getFinalPrice(pkg)
                const isSelected = buyPkg.code === pkg.code
                return (
                  <button key={pkg.code} onClick={() => setBuyPkg(pkg)}
                    className={`p-3 rounded-xl border text-left transition ${isSelected ? 'bg-amber-500/20 border-amber-500/40' : 'bg-white/5 border-white/10 hover:border-amber-500/30'}`}>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">{pkg.code}</p>
                    <p className="text-lg font-black text-white">{formatTokens(pkg.tokens)} <span className="text-[9px] text-slate-500">KWATT</span></p>
                    {pkg.bonus > 0 && <p className="text-[9px] text-emerald-400 font-bold">+{formatTokens(pkg.bonus)} bônus</p>}
                    <p className="text-xs text-amber-400 font-bold mt-1">{formatBRL(fp)}</p>
                    {pkg.discount > 0 && <p className="text-[9px] text-emerald-400">-{pkg.discount}% off</p>}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-slate-500 mb-4 text-center">Pacotes maiores (até 20% off) em <Link href="/token" className="text-amber-400 hover:underline">energialivre.dev.br/token</Link></p>

            {/* Gateway Toggle */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 text-center mb-2 font-bold uppercase tracking-wider">Forma de pagamento</p>
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                <button onClick={() => setGateway('stripe')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition ${gateway === 'stripe' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                  <CreditCard className="w-4 h-4" /> Stripe
                </button>
                <button onClick={() => setGateway('pagseguro')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition ${gateway === 'pagseguro' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                  <Banknote className="w-4 h-4" /> PagSeguro
                </button>
              </div>
              {gateway === 'pagseguro' && (
                <div className="mt-2 flex items-center justify-center gap-3">
                  {(['PIX', 'BOLETO', 'CREDIT_CARD'] as PsMethod[]).map((m) => (
                    <button key={m} onClick={() => setPsMethod(m)} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${psMethod === m ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>
                      {m === 'PIX' ? <><QrCode className="w-3 h-3 inline mr-1" />PIX</> : null}
                      {m === 'BOLETO' ? <><FileText className="w-3 h-3 inline mr-1" />Boleto</> : null}
                      {m === 'CREDIT_CARD' ? <><CreditCard className="w-3 h-3 inline mr-1" />Cartão</> : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stripe - Redirect */}
            {gateway === 'stripe' && (
              <button
                onClick={() => window.open(`/token?buy=${buyPkg.code}`, '_blank')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-900 font-black transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Comprar via Stripe
              </button>
            )}

            {/* PagSeguro - Open Modal */}
            {gateway === 'pagseguro' && (
              <button onClick={handleBuyWithPagSeguro}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-900 font-black transition flex items-center justify-center gap-2">
                <Banknote className="w-4 h-4" /> Pagar com PagSeguro
              </button>
            )}

            <p className="text-[9px] text-slate-600 text-center mt-3">Ao comprar, você concorda com nossos termos. KWATT é token de utilidade.</p>
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {redeemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Resgatar tokens</h2>
              <button onClick={() => setRedeemOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={submitRedeem} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Tipo de resgate</label>
                <select value={redeemType} onChange={(e) => setRedeemType(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white">
                  <option value="invoice_payment">Pagar fatura de energia</option>
                  <option value="donation">Doação</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Quantidade (KWATT) — max {balanceAvailable.toLocaleString('pt-BR')}</label>
                <input type="number" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} min="1" max={balanceAvailable} step="0.01" required className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white" />
                {redeemAmount && <p className="text-[10px] text-slate-500 mt-1">≈ R$ {(Number(redeemAmount) * KWATT_UNIT_PRICE).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · {(Number(redeemAmount) / currentRatio).toFixed(2)} kWh</p>}
              </div>
              {redeemMessage && (
                <div className={`p-3 rounded-lg text-xs ${redeemMessage.type === 'ok' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border border-red-500/30 text-red-200'}`}>
                  {redeemMessage.text}
                </div>
              )}
              <button type="submit" disabled={redeemSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-900 font-black transition disabled:opacity-50 flex items-center justify-center gap-2">
                {redeemSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                {redeemSubmitting ? 'Processando...' : 'Confirmar resgate'}
              </button>
              <p className="text-[10px] text-slate-500 text-center">Resgates entram em fila de aprovação. Processamento: até 24h.</p>
            </form>
          </div>
        </div>
      )}

      {/* PagSeguro Modal */}
      {psModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => { if (!psLoading) setPsModal(false) }}>
          <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPsModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition"><X className="w-4 h-4 text-slate-400" /></button>

            {psLoading && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
                <p className="text-white font-bold">Gerando pagamento...</p>
              </div>
            )}

            {psError && !psLoading && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4"><X className="w-6 h-6 text-red-400" /></div>
                <p className="text-red-400 font-bold mb-2">Erro no pagamento</p>
                <p className="text-sm text-slate-400 mb-6">{psError}</p>
                <button onClick={() => setPsModal(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition">Fechar</button>
              </div>
            )}

            {psResult && !psLoading && (
              <div className="text-center">
                {psMethod === 'PIX' && (
                  <>
                    <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4"><QrCode className="w-7 h-7 text-amber-400" /></div>
                    <h3 className="text-lg font-bold text-white mb-1">PIX gerado!</h3>
                    <p className="text-xs text-slate-400 mb-4">Escaneie o QR Code ou copie o código PIX</p>
                    {psResult.qrCodeImage && (
                      <div className="mb-4 inline-block p-3 bg-white rounded-2xl">
                        <img src={`data:image/png;base64,${psResult.qrCodeImage}`} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                      </div>
                    )}
                    {psResult.pixCopyPaste && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 break-all text-left">
                          <span className="flex-1 truncate">{psResult.pixCopyPaste}</span>
                          <button onClick={() => { navigator.clipboard.writeText(psResult.pixCopyPaste); setPixCopied(true); setTimeout(() => setPixCopied(false), 2000) }} className="p-1.5 rounded-lg hover:bg-white/10 shrink-0 transition">
                            {pixCopied ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-500 mb-4">Confirmação automática em até 5 minutos.</p>
                    <button onClick={() => setPsModal(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition">Confirmar depois</button>
                  </>
                )}
                {psMethod === 'BOLETO' && psResult.boletoLink && (
                  <>
                    <FileText className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">Boleto gerado!</h3>
                    <a href={psResult.boletoLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-xl font-bold text-sm hover:bg-yellow-500/30 transition mb-4"><FileText className="w-4 h-4" /> Ver Boleto</a>
                    <button onClick={() => setPsModal(false)} className="block mx-auto text-xs text-slate-500 hover:text-white transition">Fechar</button>
                  </>
                )}
                {psMethod === 'CREDIT_CARD' && (
                  <>
                    <CreditCard className="w-10 h-10 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">Cartão de crédito</h3>
                    {psResult.redirectUrl ? (
                      <a href={psResult.redirectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl font-bold text-sm hover:bg-amber-500/30 transition mb-4">Finalizar Pagamento</a>
                    ) : <p className="text-sm text-emerald-400 font-bold mb-4">Pagamento aprovado!</p>}
                    <button onClick={() => setPsModal(false)} className="block mx-auto text-xs text-slate-500 hover:text-white transition">Fechar</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function TxRow({ tx }: { tx: TokenTx }) {
  const isIn = tx.direction === 'in'
  const date = new Date(tx.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950 border border-white/5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isIn ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
        {isIn ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{getTypeLabel(tx.tx_type, tx.purpose)}</p>
        <p className="text-[10px] text-slate-500">{date} · {tx.status}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold tabular-nums ${isIn ? 'text-emerald-400' : 'text-orange-400'}`}>{isIn ? '+' : '-'}{tx.amount.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
        <p className="text-[9px] text-slate-500">{KWATT_SYMBOL}</p>
      </div>
    </div>
  )
}

function getTypeLabel(type: string, purpose: string | null): string {
  const map: Record<string, string> = {
    mint: 'Mint (recebido)', burn: 'Queima (resgate)', transfer: 'Transferência',
    redeem: `Resgate — ${purpose || 'utilidade'}`, cashback: 'Cashback recebido',
    referral: 'Bônus de indicação', reward: 'Recompensa da plataforma', presale: 'Pré-venda',
  }
  return map[type] || type
}