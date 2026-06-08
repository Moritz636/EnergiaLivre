'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Zap, ShieldCheck, Loader2, Crown, Sparkles,
  CheckCircle2, Star, MapPin, Heart, Users, Clock,
  CreditCard, Banknote, QrCode, FileText, X, Copy, Check,
} from 'lucide-react';
import { STRIPE_PAYMENT_LINKS } from '@/lib/stripe-prices';
import { getMemberPlusStatus } from '@/lib/member-plus';

type Gateway = 'stripe' | 'pagseguro'
type PsMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD'

export default function CheckoutMemberPlusPage() {
  const [user, setUser] = useState<any>(null);
  const [alreadyActive, setAlreadyActive] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
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
      if (!user) { router.push('/login?redirect=/checkout-member-plus'); return; }
      setUser(user);
      const status = await getMemberPlusStatus(supabase, user.id);
      if (status.active) { setAlreadyActive(true); setDaysRemaining(status.daysRemaining ?? 0); }
    };
    checkUser();
  }, []);

  const handleAssinar = async () => {
    if (gateway === 'stripe') {
      window.location.href = STRIPE_PAYMENT_LINKS.MEMBER_PLUS;
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
          userId: user?.id ?? 'guest', type: 'member_plus',
          description: 'Member Plus - Match geolocalizado',
          amount: 9.99, paymentMethod: psMethod,
          customerName: user?.email?.split('@')[0] ?? 'Cliente',
          customerEmail: user?.email ?? '',
          referenceId: `MEMBER-${user?.id}-${Date.now()}`,
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

  if (!user) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-emerald-400 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </div>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold mb-4">
              <Crown className="w-3.5 h-3.5" /> Member Plus
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Conecte-se a <span className="text-yellow-400">geradores próximos</span>
            </h1>
            <p className="text-slate-400">Acesse o mapa de geradores da sua região e dê match.</p>
          </div>

          {/* Gateway toggle */}
          <div className="max-w-md mx-auto mb-8">
            <p className="text-xs text-slate-500 text-center mb-3 font-bold uppercase tracking-wider">Forma de pagamento</p>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              <button onClick={() => setGateway('stripe')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition ${gateway === 'stripe' ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <CreditCard className="w-4 h-4" /> Stripe
              </button>
              <button onClick={() => setGateway('pagseguro')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition ${gateway === 'pagseguro' ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <Banknote className="w-4 h-4" /> PagSeguro
              </button>
            </div>
            {gateway === 'pagseguro' && (
              <div className="mt-2 flex items-center justify-center gap-3">
                {(['PIX', 'BOLETO', 'CREDIT_CARD'] as PsMethod[]).map((m) => (
                  <button key={m} onClick={() => setPsMethod(m)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${psMethod === m ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>
                    {m === 'PIX' ? <><QrCode className="w-3 h-3 inline mr-1" />PIX</> : null}
                    {m === 'BOLETO' ? <><FileText className="w-3 h-3 inline mr-1" />Boleto</> : null}
                    {m === 'CREDIT_CARD' ? <><CreditCard className="w-3 h-3 inline mr-1" />Cartão</> : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          {alreadyActive && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-emerald-300 text-sm">Você já é Member Plus. Restam <strong>{daysRemaining} dias</strong>.</p>
              <Link href="/dashboard/match" className="ml-auto px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition">Ir para o Match →</Link>
            </div>
          )}

          <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-yellow-500/10 border-2 border-yellow-500/30 mb-8 shadow-[0_0_50px_rgba(234,179,8,0.15)]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 mb-4">
                <Crown className="w-7 h-7 text-slate-900" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Member Plus</h2>
              <p className="text-slate-400 text-sm mb-6">Match geolocalizado + propostas ilimitadas</p>

              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="text-5xl font-black text-white">R$ 9,99</span>
                <span className="text-slate-400">/mês</span>
              </div>

              <ul className="space-y-3 mb-8 text-left max-w-md mx-auto">
                {[
                  { icon: MapPin, text: '<strong className="text-white">Mapa interativo</strong> com geradores próximos (raio ajustável)' },
                  { icon: Heart, text: '<strong className="text-white">Match com 1 clique</strong>: curta perfis e envie propostas' },
                  { icon: Users, text: '<strong className="text-white">Chat integrado</strong> para negociar condições' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-3 h-3 text-yellow-400" />
                    </div>
                    <span className="text-slate-300 text-sm" dangerouslySetInnerHTML={{ __html: item.text }} />
                  </li>
                ))}
              </ul>

              <button onClick={handleAssinar} disabled={alreadyActive}
                className="w-full max-w-md mx-auto py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {alreadyActive ? 'Você já é Member Plus' : <><Sparkles className="w-5 h-5" /> Ativar Member Plus Agora</>}
              </button>

              <p className="text-xs text-slate-500 mt-3">Cancele quando quiser. Sem fidelidade.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: ShieldCheck, title: 'Pagamento seguro', desc: gateway === 'stripe' ? 'Stripe processa 100%' : 'PagSeguro processa 100%' },
              { icon: Clock, title: 'Ativação imediata', desc: 'Acesso em até 1 minuto' },
              { icon: Star, title: 'Suporte VIP', desc: 'WhatsApp prioritário' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <item.icon className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-[10px] text-slate-600">Ao assinar, você concorda com nossos Termos de Uso.</p>
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
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-4" />
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
                    <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-7 h-7 text-yellow-400" />
                    </div>
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
                          <button onClick={copyPix} className="p-1.5 rounded-lg hover:bg-white/10 shrink-0 transition">
                            {copied ? <Check className="w-4 h-4 text-yellow-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
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
                    <CreditCard className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">Cartão de crédito</h3>
                    <p className="text-xs text-slate-400 mb-4">Pagamento processado com segurança</p>
                    {psResult.redirectUrl ? (
                      <a href={psResult.redirectUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-xl font-bold text-sm hover:bg-yellow-500/30 transition mb-4">
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