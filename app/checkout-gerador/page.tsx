'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Zap, ShieldCheck, Loader2, Crown, Sparkles,
  CheckCircle2, Star, TrendingUp, Clock, Sun, BadgeCheck,
  Wallet, BarChart3, Plug, CreditCard, Banknote, QrCode,
  FileText, X, Copy, Check,
} from 'lucide-react';
import { STRIPE_PAYMENT_LINKS } from '@/lib/stripe-prices';

type Gateway = 'stripe' | 'pagseguro'
type PsMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD'

type GeradorPlano = {
  codigo: 'starter' | 'pro' | 'premium'
  nome: string
  capacidadeLabel: string
  capacidadeKwp: number
  preco: number
  precoFormatado: string
  destaque: boolean
  economia: string
  paymentLink: string
  beneficios: string[]
}

const planos: GeradorPlano[] = [
  {
    codigo: 'starter', nome: 'Solar Starter', capacidadeLabel: 'até 30 kWp', capacidadeKwp: 30,
    preco: 49.90, precoFormatado: 'R$ 49,90', destaque: false, economia: 'Conecte até 5 consumidores',
    paymentLink: STRIPE_PAYMENT_LINKS.GERADOR_STARTER,
    beneficios: ['Cadastro da usina em até 7 dias', 'Match com consumidores próximos', 'Gestão de contratos básicos', 'Suporte por WhatsApp'],
  },
  {
    codigo: 'pro', nome: 'Solar Pro', capacidadeLabel: 'até 100 kWp', capacidadeKwp: 100,
    preco: 99.90, precoFormatado: 'R$ 99,90', destaque: true, economia: 'Conecte até 25 consumidores',
    paymentLink: STRIPE_PAYMENT_LINKS.GERADOR_PRO,
    beneficios: ['Match prioritário com consumidores da região', 'Relatórios mensais de venda e lucro', 'Gestão de múltiplas unidades consumidoras', 'Suporte prioritário (resposta em 4h)'],
  },
  {
    codigo: 'premium', nome: 'Solar Premium', capacidadeLabel: 'acima de 100 kWp', capacidadeKwp: 500,
    preco: 199.90, precoFormatado: 'R$ 199,90', destaque: false, economia: 'Conexões ilimitadas',
    paymentLink: STRIPE_PAYMENT_LINKS.GERADOR_PREMIUM,
    beneficios: ['Match ilimitado + destaque no mapa', 'Consultoria financeira mensal dedicada', 'API de integração com seu sistema', 'Gerente de conta exclusivo'],
  },
]

export default function CheckoutGeradorPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedPlano, setSelectedPlano] = useState<GeradorPlano>(planos[1]);
  const [loadingPlano, setLoadingPlano] = useState<string | null>(null);
  const [profileTipo, setProfileTipo] = useState<string | null>(null);
  const [gateway, setGateway] = useState<Gateway>('stripe');
  const [psMethod, setPsMethod] = useState<PsMethod>('PIX');
  const [psModal, setPsModal] = useState(false);
  const [psResult, setPsResult] = useState<any>(null);
  const [psLoading, setPsLoading] = useState(false);
  const [psError, setPsError] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login?redirect=/checkout-gerador'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('profiles').select('tipo').eq('id', user.id).single();
      const tipo = (profile as { tipo?: string } | null)?.tipo ?? null;
      setProfileTipo(tipo);
      if (tipo && tipo !== 'gerador') router.replace('/dashboard');
    };
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleAssinar = async (plano: GeradorPlano) => {
    if (gateway === 'stripe') {
      setLoadingPlano(plano.codigo);
      window.location.href = plano.paymentLink;
      return;
    }
    setPsModal(true);
    setPsLoading(true);
    setPsError('');
    try {
      const res = await fetch('/api/pagseguro/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id ?? 'guest', type: 'plan_subscription',
          description: `${plano.nome} - ${plano.capacidadeLabel}`,
          amount: plano.preco, paymentMethod: psMethod,
          customerName: user?.email?.split('@')[0] ?? 'Cliente',
          customerEmail: user?.email ?? '',
          referenceId: `PLANO-${user?.id}-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro PagSeguro');
      setPsResult(data.charge);
    } catch (err: any) {
      setPsError(err.message);
    } finally {
      setPsLoading(false);
    }
  };

  const copyPix = () => {
    if (psResult?.pixCopyPaste) {
      navigator.clipboard.writeText(psResult.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user || (profileTipo && profileTipo !== 'gerador')) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard-gerador" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
          </Link>
          <Link href="/dashboard-gerador" className="text-sm text-slate-400 hover:text-emerald-400 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </div>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold mb-4">
              <Sun className="w-3.5 h-3.5" /> Planos para Geradores
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Venda seu excedente de <span className="text-blue-400">energia solar</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Comece em 7 dias. Sem investimento inicial, sem fidelidade.
            </p>
          </div>

          {/* Gateway toggle */}
          <div className="max-w-md mx-auto mb-10">
            <p className="text-xs text-slate-500 text-center mb-3 font-bold uppercase tracking-wider">Forma de pagamento</p>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              <button onClick={() => setGateway('stripe')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition ${gateway === 'stripe' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <CreditCard className="w-4 h-4" /> Stripe
              </button>
              <button onClick={() => setGateway('pagseguro')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition ${gateway === 'pagseguro' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <Banknote className="w-4 h-4" /> PagSeguro
              </button>
            </div>
            {gateway === 'pagseguro' && (
              <div className="mt-2 flex items-center justify-center gap-3">
                {(['PIX', 'BOLETO', 'CREDIT_CARD'] as PsMethod[]).map((m) => (
                  <button key={m} onClick={() => setPsMethod(m)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${psMethod === m ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>
                    {m === 'PIX' ? <><QrCode className="w-3 h-3 inline mr-1" />PIX</> : null}
                    {m === 'BOLETO' ? <><FileText className="w-3 h-3 inline mr-1" />Boleto</> : null}
                    {m === 'CREDIT_CARD' ? <><CreditCard className="w-3 h-3 inline mr-1" />Cartão</> : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Planos */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {planos.map((plano) => (
              <div key={plano.codigo}
                className={`relative p-6 rounded-2xl transition-all duration-300 ${selectedPlano.codigo === plano.codigo ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-white/5 border border-white/10 hover:border-blue-500/50 hover:-translate-y-1'}`}>
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3" /> Mais Escolhido
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 mb-3">
                    <Sun className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{plano.nome}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plano.capacidadeLabel}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-white">{plano.precoFormatado}</span>
                    <span className="text-slate-400 text-sm">/mês</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">{plano.economia}</p>
                  <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                    <TrendingUp className="w-3 h-3" /> Sem fidelidade
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plano.beneficios.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { setSelectedPlano(plano); handleAssinar(plano); }}
                  disabled={loadingPlano === plano.codigo}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${selectedPlano.codigo === plano.codigo ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {loadingPlano === plano.codigo ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Assinar Agora'}
                </button>
              </div>
            ))}
          </div>

          {/* Como funciona */}
          <div className="mb-12 p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white text-center mb-6">
              <BarChart3 className="w-5 h-5 inline-block mr-2 text-blue-400" /> Como funciona em 4 passos
            </h3>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {[
                { icon: Plug, label: '1. Conecte', desc: 'Cadastre sua usina e medidor' },
                { icon: BadgeCheck, label: '2. Valide', desc: 'Aprovação técnica em 7 dias' },
                { icon: Sparkles, label: '3. Match', desc: 'Aparecemos para consumidores' },
                { icon: Wallet, label: '4. Receba', desc: 'Todo mês, direto na conta' },
              ].map((step, i) => (
                <div key={i} className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <step.icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">{step.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" /> Pagamento 100% Seguro</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500" /> Cancele quando quiser</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Ativação em até 7 dias</div>
            </div>
            <p className="text-[10px] text-slate-600 mt-4">Ao assinar, você concorda com nossos Termos de Uso.</p>
          </div>
        </div>
      </div>

      {/* PagSeguro Modal */}
      {psModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => { if (!psLoading) setPsModal(false) }}>
          <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPsModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition">
              <X className="w-4 h-4 text-slate-400" />
            </button>

            {psLoading && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-white font-bold">Gerando pagamento...</p>
              </div>
            )}

            {psError && !psLoading && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-red-400 font-bold mb-2">Erro no pagamento</p>
                <p className="text-sm text-slate-400 mb-6">{psError}</p>
                <button onClick={() => setPsModal(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition">Fechar</button>
              </div>
            )}

            {psResult && !psLoading && (
              <div className="text-center">
                {psMethod === 'PIX' && (
                  <>
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">PIX gerado!</h3>
                    <p className="text-xs text-slate-400 mb-4">Escaneie o QR Code ou copie o código PIX</p>
                    {psResult.qrCodeImage && (
                      <div className="mb-4 inline-block p-3 bg-white rounded-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`data:image/png;base64,${psResult.qrCodeImage}`} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                      </div>
                    )}
                    {psResult.pixCopyPaste && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 break-all text-left">
                          <span className="flex-1 truncate">{psResult.pixCopyPaste}</span>
                          <button onClick={copyPix} className="p-1.5 rounded-lg hover:bg-white/10 shrink-0 transition">
                            {copied ? <Check className="w-4 h-4 text-blue-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-500 mb-4">O pagamento será confirmado automaticamente em até 5 minutos.</p>
                    <button onClick={() => setPsModal(false)} className="px-6 py-2 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition">Confirmar depois</button>
                  </>
                )}
                {psMethod === 'BOLETO' && psResult.boletoLink && (
                  <>
                    <FileText className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">Boleto gerado!</h3>
                    <p className="text-xs text-slate-400 mb-4">Clique abaixo para visualizar e pagar</p>
                    <a href={psResult.boletoLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-xl font-bold text-sm hover:bg-yellow-500/30 transition mb-4">
                      <FileText className="w-4 h-4" /> Ver Boleto
                    </a>
                    <button onClick={() => setPsModal(false)} className="block mx-auto text-xs text-slate-500 hover:text-white transition">Fechar</button>
                  </>
                )}
                {psMethod === 'CREDIT_CARD' && (
                  <>
                    <CreditCard className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">Cartão de crédito</h3>
                    <p className="text-xs text-slate-400 mb-4">Pagamento processado com segurança</p>
                    {psResult.redirectUrl ? (
                      <a href={psResult.redirectUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-xl font-bold text-sm hover:bg-blue-500/30 transition mb-4">
                        Finalizar Pagamento
                      </a>
                    ) : (
                      <p className="text-sm text-emerald-400 font-bold mb-4">Pagamento aprovado!</p>
                    )}
                    <button onClick={() => setPsModal(false)} className="block mx-auto text-xs text-slate-500 hover:text-white transition">Fechar</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}