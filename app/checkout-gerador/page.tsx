'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Zap, ShieldCheck, Loader2, Crown, Sparkles,
  CheckCircle2, Star, TrendingUp, Clock, Sun, BadgeCheck,
  Wallet, BarChart3, Plug, CreditCard,
} from 'lucide-react';
import { STRIPE_PAYMENT_LINKS } from '@/lib/stripe-prices';

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

  const handleAssinar = (plano: GeradorPlano) => {
    setLoadingPlano(plano.codigo);
    window.location.href = plano.paymentLink;
  };

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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-4">
              <Sun className="w-3.5 h-3.5" /> Monetize sua energia
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Escolha o <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">plano ideal</span> para sua usina
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Cada plano oferece ferramentas para você vender seu excedente de energia solar com segurança e transparência.
            </p>
          </div>

          <div className="max-w-md mx-auto mb-10">
            <p className="text-xs text-slate-500 text-center mb-3 font-bold uppercase tracking-wider">Pagamento via Stripe</p>
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
              <CreditCard className="w-5 h-5 text-blue-400 inline mr-2" />
              <span className="text-sm text-blue-300 font-bold">Cartão de crédito, débito ou boleto</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {planos.map((plano) => (
              <div
                key={plano.codigo}
                className={`relative p-6 rounded-2xl transition-all duration-300 ${
                  selectedPlano.codigo === plano.codigo
                    ? 'bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                    : 'bg-white/5 border border-white/10 hover:border-blue-500/50 hover:-translate-y-1'
                }`}
              >
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3" /> Recomendado
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white">{plano.nome}</h3>
                  <p className="text-sm text-slate-400">{plano.capacidadeLabel}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-white">{plano.precoFormatado}</span>
                    <span className="text-slate-400 text-sm">/mês</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{plano.economia}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plano.beneficios.map((b, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setSelectedPlano(plano); handleAssinar(plano); }}
                  disabled={loadingPlano === plano.codigo}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    selectedPlano.codigo === plano.codigo
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {loadingPlano === plano.codigo ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Assinar Agora'
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-400" /> Pagamento 100% Seguro</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-blue-400" /> Cancele quando quiser</div>
              <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Relatórios Mensais</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
