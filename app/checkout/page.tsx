'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { STRIPE_PAYMENT_LINKS } from '@/lib/stripe-prices';
import {
  ArrowLeft, Zap, ShieldCheck, Loader2, Crown, Sparkles,
  CheckCircle2, Star, TrendingUp, Clock, CreditCard,
} from 'lucide-react';

const planos = [
  {
    id: 'basico', nome: 'Plano Básico', kWh: 300, preco: 89.90,
    precoFormatado: 'R$ 89,90', destaque: false, economia: 25,
    paymentLink: STRIPE_PAYMENT_LINKS.CONSUMIDOR_BASICO,
    beneficios: ['300 kWh de energia limpa/mês', 'Economia de até 25% na conta', 'Sem fidelidade', 'Suporte por WhatsApp'],
  },
  {
    id: 'familiar', nome: 'Plano Familiar', kWh: 500, preco: 149.90,
    precoFormatado: 'R$ 149,90', destaque: true, economia: 32,
    paymentLink: STRIPE_PAYMENT_LINKS.CONSUMIDOR_FAMILIAR,
    beneficios: ['500 kWh de energia limpa/mês', 'Economia de até 32% na conta', 'Prioridade no match', 'Suporte VIP 24/7'],
  },
  {
    id: 'premium', nome: 'Plano Premium', kWh: 1000, preco: 289.90,
    precoFormatado: 'R$ 289,90', destaque: false, economia: 38,
    paymentLink: STRIPE_PAYMENT_LINKS.CONSUMIDOR_PREMIUM,
    beneficios: ['1000 kWh de energia limpa/mês', 'Economia de até 38% na conta', 'Match prioritário', 'Consultoria personalizada'],
  },
];

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedPlano, setSelectedPlano] = useState(planos[1]);
  const [loadingPlano, setLoadingPlano] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
    };
    checkUser();
  }, [supabase, router]);

  const handleAssinar = async (plano: typeof planos[0]) => {
    setLoadingPlano(plano.id);
    window.location.href = plano.paymentLink;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard-consumidor" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
          </Link>
          <Link href="/dashboard-consumidor" className="text-sm text-slate-400 hover:text-emerald-400 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </div>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
              <Crown className="w-3.5 h-3.5" /> Escolha seu plano
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Economize ainda mais com <span className="text-emerald-400">energia solar</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Assine um dos planos e maximize sua economia na conta de luz.
              Sem instalação, sem burocracia, sem fidelidade.
            </p>
          </div>

          <div className="max-w-md mx-auto mb-10">
            <p className="text-xs text-slate-500 text-center mb-3 font-bold uppercase tracking-wider">Pagamento via Stripe</p>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <CreditCard className="w-5 h-5 text-emerald-400 inline mr-2" />
              <span className="text-sm text-emerald-300 font-bold">Cartão de crédito, débito ou boleto</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className={`relative p-6 rounded-2xl transition-all duration-300 ${
                  selectedPlano.id === plano.id
                    ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                    : 'bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:-translate-y-1'
                }`}
              >
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3" /> Mais Escolhido
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white">{plano.nome}</h3>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-white">{plano.precoFormatado}</span>
                    <span className="text-slate-400 text-sm">/mês</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">{plano.kWh} kWh de energia</p>
                  <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    <TrendingUp className="w-3 h-3" /> Economia de até {plano.economia}%
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plano.beneficios.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setSelectedPlano(plano); handleAssinar(plano); }}
                  disabled={loadingPlano === plano.id}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    selectedPlano.id === plano.id
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 hover:from-emerald-400 hover:to-emerald-500 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {loadingPlano === plano.id ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Assinar Agora'
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mb-12 p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white text-center mb-6">💰 Comparativo de Economia Mensal</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <p className="text-sm text-slate-400">Sem energia solar</p>
                <p className="text-xl font-bold text-red-400">R$ 350,00</p>
              </div>
              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <p className="text-sm text-slate-400">Plano Básico</p>
                <p className="text-xl font-bold text-yellow-400">R$ 262,50</p>
                <p className="text-xs text-emerald-400">↓ Economia de R$ 87,50</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                <p className="text-sm text-slate-400">Plano Familiar</p>
                <p className="text-xl font-bold text-emerald-400">R$ 238,00</p>
                <p className="text-xs text-emerald-400">↓ Economia de R$ 112,00</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 mb-8 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
              <Image src="/images/atendente-checkout.webp" alt="Atendente" width={56} height={56} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Suporte técnico disponível</p>
              <p className="text-[10px] text-slate-500">Tire dúvidas sobre planos e consumo</p>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Pagamento 100% Seguro</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-500" /> Cancele quando quiser</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> Ativação em até 48h</div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-sm font-bold text-white mb-1">Precisa de ajuda?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fale com um técnico especializado. Ele analisará seu consumo e indicará o melhor plano.
                </p>
              </div>
              <a href="https://wa.me/5584987858668?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20para%20escolher%20o%20plano%20ideal." target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-bold text-sm transition shadow-lg flex-shrink-0">
                Falar com Técnico
              </a>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[10px] text-slate-600 text-center">
              Ao assinar, você concorda com nossos Termos de Uso. A economia é estimada e pode variar conforme sua região e consumo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
