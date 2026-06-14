'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Zap, ShieldCheck, Loader2, Crown,
  CheckCircle2, Star, TrendingUp, Clock, CreditCard,
  Sparkles, Eye,
} from 'lucide-react';

const MEMBER_PLUS_PRICE_ID = 'price_1Qwe3RStripeFixoMemberPlus'
const STRIPE_CHECKOUT_URL = `/api/stripe/checkout`

export default function CheckoutMemberPlusPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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

  const handleCheckout = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(STRIPE_CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: MEMBER_PLUS_PRICE_ID,
          userId: user.id,
          successUrl: `${window.location.origin}/match?unlocked=1&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/match?canceled=1`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao gerar checkout');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const beneficios = [
    { icon: Eye, text: 'Veja todas as usinas disponíveis sem borrão' },
    { icon: Sparkles, text: 'Matches ilimitados por 30 dias' },
    { icon: TrendingUp, text: 'Comparador de preços e condições' },
    { icon: ShieldCheck, text: 'Suporte prioritário' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/match" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
          </Link>
          <Link href="/match" className="text-sm text-slate-400 hover:text-emerald-400 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </div>

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-6">
            <Crown className="w-3.5 h-3.5" /> Member Plus
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Desbloqueie o <span className="text-emerald-400">Match Completo</span>
          </h1>
          <p className="text-slate-400 mb-8">
            Tenha acesso total a todas as usinas disponíveis, compare preços e encontre a melhor oferta de energia solar para você.
          </p>

          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-8 mb-8">
            <p className="text-sm text-emerald-400 font-bold uppercase tracking-wider mb-2">Acesso por</p>
            <div className="text-5xl font-black text-white mb-2">R$ 9,<span className="text-3xl">99</span></div>
            <p className="text-slate-400 text-sm">Único pagamento — 30 dias de acesso total</p>
          </div>

          <div className="text-left space-y-4 mb-8">
            {beneficios.map((b, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <b.icon className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-300">{b.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
            {loading ? 'Abrindo checkout...' : 'Pagar com Cartão'}
          </button>

          <p className="mt-6 text-xs text-slate-600">
            Pagamento processado com segurança pela Stripe. Aceitamos cartão de crédito, débito e boleto.
          </p>
        </div>
      </div>
    </div>
  );
}
