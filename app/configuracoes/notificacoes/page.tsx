'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Mail, MessageCircle, Save, Loader2 } from 'lucide-react';

export default function ConfiguracoesNotificacoesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_match: true,
    email_economia: true,
    email_alerta: true,
    whatsapp_match: false,
    whatsapp_economia: false,
    whatsapp_alerta: false,
  });
  
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
      await carregarConfiguracoes(user.id);
      setLoading(false);
    };
    checkUser();
  }, []);

  const carregarConfiguracoes = async (userId: string) => {
    const { data } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setSettings({
        email_match: data.email_match,
        email_economia: data.email_economia,
        email_alerta: data.email_alerta,
        whatsapp_match: data.whatsapp_match,
        whatsapp_economia: data.whatsapp_economia,
        whatsapp_alerta: data.whatsapp_alerta,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString()
      });

    if (error) {
      alert('Erro ao salvar configurações');
    } else {
      alert('Configurações salvas com sucesso!');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Configurações de Notificação</h1>
          </div>
          <p className="text-slate-400 mb-8">Escolha como e quando receber notificações</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* E-mail */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Notificações por E-mail</h2>
              </div>
              <div className="space-y-3 ml-7">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Novos matches</span>
                  <input
                    type="checkbox"
                    checked={settings.email_match}
                    onChange={(e) => setSettings({...settings, email_match: e.target.checked})}
                    className="w-5 h-5 rounded bg-slate-800 border-white/20 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Atualizações de economia</span>
                  <input
                    type="checkbox"
                    checked={settings.email_economia}
                    onChange={(e) => setSettings({...settings, email_economia: e.target.checked})}
                    className="w-5 h-5 rounded bg-slate-800 border-white/20 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Alertas do sistema</span>
                  <input
                    type="checkbox"
                    checked={settings.email_alerta}
                    onChange={(e) => setSettings({...settings, email_alerta: e.target.checked})}
                    className="w-5 h-5 rounded bg-slate-800 border-white/20 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            {/* WhatsApp (próximo passo) */}
            <div className="opacity-50">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Notificações por WhatsApp</h2>
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px]">Em breve</span>
              </div>
              <div className="space-y-3 ml-7">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Novos matches</span>
                  <span className="text-xs text-slate-500">Em desenvolvimento</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Atualizações de economia</span>
                  <span className="text-xs text-slate-500">Em desenvolvimento</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 rounded-xl font-bold hover:from-emerald-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Salvando...' : 'Salvar configurações'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}