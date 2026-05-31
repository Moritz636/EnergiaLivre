'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  Zap, 
  Users, 
  DollarSign, 
  Gift, 
  Share2, 
  Copy, 
  CheckCircle,
  Crown,
  Flame,
  TrendingUp,
  Award,
  ChevronRight,
  Loader2,
  MessageCircle,
  Instagram,
  Twitter,
  Linkedin,
  UserPlus,
  Wallet,
  BarChart3
} from 'lucide-react';

export default function AliadoPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aliadoData, setAliadoData] = useState({
    indicacoes: 0,
    comissoes: 0,
    comissoesPendentes: 0,
    linkIndicacao: '',
    convitesRealizados: 0,
    convitesConvertidos: 0
  });
  const [showCopied, setShowCopied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      
      // Gerar link de indicação único
      const userId = user.id.substring(0, 8);
      setAliadoData(prev => ({
        ...prev,
        linkIndicacao: `https://energia-livre.vercel.app/cadastro?ref=${userId}`
      }));
      
      // Carregar dados do aliado do Supabase
      await carregarDadosAliado(user.id);
      
      setLoading(false);
    };
    checkUser();
  }, []);

  const carregarDadosAliado = async (userId: string) => {
    try {
      // Buscar indicações do usuário
      const { data: indicacoes } = await supabase
        .from('leads')
        .select('*')
        .eq('indicado_por', userId);
      
      const indicacoesFeitas = indicacoes?.length || 0;
      const convertidas = indicacoes?.filter(l => l.status === 'aprovado').length || 0;
      
      setAliadoData(prev => ({
        ...prev,
        indicacoes: indicacoesFeitas,
        convitesRealizados: indicacoesFeitas,
        convitesConvertidos: convertidas,
        comissoes: convertidas * 50, // R$ 50 por conversão
        comissoesPendentes: (indicacoesFeitas - convertidas) * 50
      }));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(aliadoData.linkIndicacao);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 3000);
  };

  const compartilharWhatsApp = () => {
    const text = `🚀 EnergiaLivre - Economize até 32% na conta de luz sem instalar nada!\n\nUse meu link e comece a economizar:\n${aliadoData.linkIndicacao}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const compartilharInstagram = () => {
    navigator.clipboard.writeText(aliadoData.linkIndicacao);
    alert('Link copiado! Cole no seu Instagram.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      
      {/* Efeitos de fundo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-20" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 right-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
                <Zap className="text-slate-900 w-4 h-4 fill-current" />
              </div>
              <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
            </Link>
            <div className="ml-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-[9px] font-black text-yellow-400 uppercase tracking-wider">
              Programa de Aliados
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-yellow-400" /> Aliado</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>{user.email?.split('@')[0]}</span>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold mb-6">
              <Crown className="w-3.5 h-3.5" /> Programa de Aliados
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Transforme indicações em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-emerald-500">
                renda extra
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Indique a EnergiaLivre para amigos, familiares e seguidores. 
              Você ganha <strong className="text-emerald-400">R$ 50 por cada lead que se torna cliente</strong>.
            </p>
          </div>

          {/* Cards de Ganhos */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/30 text-center">
              <UserPlus className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{aliadoData.indicacoes}</p>
              <p className="text-slate-400 text-sm">Indicações enviadas</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/30 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-emerald-400">R$ {aliadoData.comissoes}</p>
              <p className="text-slate-400 text-sm">Comissões ganhas</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Wallet className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-blue-400">R$ {aliadoData.comissoesPendentes}</p>
              <p className="text-slate-400 text-sm">Comissões pendentes</p>
            </div>
          </div>

          {/* Seu Link de Indicação */}
          <div className="mb-12 p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-400" />
              Seu link exclusivo
            </h2>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm break-all">
                {aliadoData.linkIndicacao}
              </div>
              <button
                onClick={copiarLink}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium hover:bg-emerald-500/30 transition"
              >
                {showCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {showCopied ? 'Copiado!' : 'Copiar link'}
              </button>
            </div>
          </div>

          {/* Como Ganhar */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Como funciona</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-400">1</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Compartilhe seu link</h3>
                <p className="text-slate-400 text-sm">Envie seu link exclusivo para amigos, redes sociais ou WhatsApp</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-400">2</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Pessoa se cadastra</h3>
                <p className="text-slate-400 text-sm">A pessoa usa seu link e se cadastra na plataforma</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-400">3</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Você ganha comissão</h3>
                <p className="text-slate-400 text-sm">Quando o lead se torna cliente, você recebe R$ 50</p>
              </div>
            </div>
          </div>

          {/* Tabela de Comissões */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Tabela de comissões</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-4 bg-white/10 font-bold text-white border-b border-white/10">
                <div>Nível</div>
                <div>Condição</div>
                <div>Comissão</div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4 border-b border-white/5">
                <div className="flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-400" /> Bronze</div>
                <div>Até 5 indicações convertidas</div>
                <div className="text-emerald-400">R$ 50/lead</div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4 border-b border-white/5">
                <div className="flex items-center gap-2"><Crown className="w-4 h-4 text-slate-400" /> Prata</div>
                <div>6 a 20 indicações convertidas</div>
                <div className="text-emerald-400">R$ 75/lead</div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-500" /> Ouro</div>
                <div>21+ indicações convertidas</div>
                <div className="text-emerald-400">R$ 100/lead</div>
              </div>
            </div>
          </div>

          {/* Compartilhe nas Redes */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Compartilhe agora</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={compartilharWhatsApp}
                className="flex items-center gap-3 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-medium hover:bg-green-500/30 transition"
              >
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </button>
              <button
                onClick={compartilharInstagram}
                className="flex items-center gap-3 px-6 py-3 bg-pink-500/20 border border-pink-500/30 rounded-xl text-pink-400 font-medium hover:bg-pink-500/30 transition"
              >
                <Instagram className="w-5 h-5" /> Instagram
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(aliadoData.linkIndicacao)}
                className="flex items-center gap-3 px-6 py-3 bg-slate-500/20 border border-slate-500/30 rounded-xl text-slate-300 font-medium hover:bg-slate-500/30 transition"
              >
                <Copy className="w-5 h-5" /> Copiar link
              </button>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-white/10">
            <Zap className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Comece a ganhar agora!</h3>
            <p className="text-slate-400 mb-4">Compartilhe seu link e transforme suas indicações em renda extra.</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all"
            >
              Voltar para Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}