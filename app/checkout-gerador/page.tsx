'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Zap,
  ShieldCheck,
  Loader2,
  Crown,
  Sparkles,
  CheckCircle2,
  Star,
  TrendingUp,
  Clock,
  Sun,
  BadgeCheck,
  Wallet,
  BarChart3,
  Plug,
} from 'lucide-react';
import { STRIPE_PRICE_IDS, type StripePriceId } from '@/lib/stripe-prices';

type GeradorPlano = {
  priceId: StripePriceId
  codigo: 'starter' | 'pro' | 'premium'
  nome: string
  capacidadeLabel: string
  capacidadeKwp: number
  preco: number
  precoFormatado: string
  destaque: boolean
  economia: string
  beneficios: string[]
}

const planos: GeradorPlano[] = [
  {
    priceId: STRIPE_PRICE_IDS.GERADOR_STARTER,
    codigo: 'starter',
    nome: 'Solar Starter',
    capacidadeLabel: 'até 30 kWp',
    capacidadeKwp: 30,
    preco: 49.9,
    precoFormatado: 'R$ 49,90',
    destaque: false,
    economia: 'Conecte até 5 consumidores',
    beneficios: [
      'Cadastro da usina em até 7 dias',
      'Match com consumidores próximos',
      'Gestão de contratos básicos',
      'Suporte por WhatsApp',
    ],
  },
  {
    priceId: STRIPE_PRICE_IDS.GERADOR_PRO,
    codigo: 'pro',
    nome: 'Solar Pro',
    capacidadeLabel: 'até 100 kWp',
    capacidadeKwp: 100,
    preco: 99.9,
    precoFormatado: 'R$ 99,90',
    destaque: true,
    economia: 'Conecte até 25 consumidores',
    beneficios: [
      'Match prioritário com consumidores da região',
      'Relatórios mensais de venda e lucro',
      'Gestão de múltiplas unidades consumidoras',
      'Suporte prioritário (resposta em 4h)',
    ],
  },
  {
    priceId: STRIPE_PRICE_IDS.GERADOR_PREMIUM,
    codigo: 'premium',
    nome: 'Solar Premium',
    capacidadeLabel: 'acima de 100 kWp',
    capacidadeKwp: 500,
    preco: 199.9,
    precoFormatado: 'R$ 199,90',
    destaque: false,
    economia: 'Conexões ilimitadas',
    beneficios: [
      'Match ilimitado + destaque no mapa',
      'Consultoria financeira mensal dedicada',
      'API de integração com seu sistema',
      'Gerente de conta exclusivo',
    ],
  },
]

export default function CheckoutGeradorPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState<GeradorPlano>(planos[1]);
  const [loadingPlano, setLoadingPlano] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [profileTipo, setProfileTipo] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/checkout-gerador');
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo')
        .eq('id', user.id)
        .single();
      const tipo = (profile as { tipo?: string } | null)?.tipo ?? null;
      setProfileTipo(tipo);
      if (tipo && tipo !== 'gerador') {
        router.replace('/dashboard');
      }
    };
    checkUser();
  }, []);

  const handleAssinar = async (plano: GeradorPlano) => {
    setLoadingPlano(plano.codigo);
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plano.priceId,
          planoTipo: 'gerador',
          planoCodigo: plano.codigo,
          planoNome: plano.nome,
          customerEmail: user?.email,
          successUrl: `${window.location.origin}/dashboard-gerador?success=true`,
          cancelUrl: `${window.location.origin}/checkout-gerador?canceled=true`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Erro ao criar sessão de pagamento. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao criar checkout:', err);
      setError('Erro ao iniciar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
      setLoadingPlano(null);
    }
  };

  if (!user || (profileTipo && profileTipo !== 'gerador')) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold mb-4">
              <Sun className="w-3.5 h-3.5" /> Planos para Geradores
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Venda seu excedente de <span className="text-blue-400">energia solar</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Comece em 7 dias. Sem investimento inicial, sem fidelidade.
              Conectamos sua usina a consumidores da sua região.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {planos.map((plano) => (
              <div
                key={plano.codigo}
                className={`relative p-6 rounded-2xl transition-all duration-300 ${
                  selectedPlano.codigo === plano.codigo
                    ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                    : 'bg-white/5 border border-white/10 hover:border-blue-500/50 hover:-translate-y-1'
                }`}
              >
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
                  {plano.beneficios.map((beneficio, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      {beneficio}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    setSelectedPlano(plano)
                    handleAssinar(plano)
                  }}
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

          {error && (
            <div className="text-center mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-12 p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white text-center mb-6">
              <BarChart3 className="w-5 h-5 inline-block mr-2 text-blue-400" />
              Como funciona em 4 passos
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
            <p className="text-[10px] text-slate-600 mt-4">
              Ao assinar, você concorda com nossos Termos de Uso. A rentabilidade depende de fatores regulatórios e demanda regional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
