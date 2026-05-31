'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Zap, TrendingUp, AlertCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    carregarNotificacoes();

    // Fechar dropdown ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const carregarNotificacoes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const response = await fetch(`/api/notifications?userId=${user.id}`);
    const result = await response.json();
    
    if (result.success) {
      setNotifications(result.data);
      setUnreadCount(result.unreadCount);
    }
    setLoading(false);
  };

  const marcarComoLida = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id })
    });
    
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, lida: true } : n
    ));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const marcarTodasComoLidas = async () => {
    for (const notification of notifications.filter(n => !n.lida)) {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id })
      });
    }
    
    setNotifications(notifications.map(n => ({ ...n, lida: true })));
    setUnreadCount(0);
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'match': return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'economia': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'alerta': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    const agora = new Date();
    const diffHoras = Math.floor((agora.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHoras < 1) return 'Agora pouco';
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-all"
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#0a0a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Carregando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer ${!notification.lida ? 'bg-emerald-500/5' : ''}`}
                  onClick={() => marcarComoLida(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${!notification.lida ? 'text-white' : 'text-slate-400'}`}>
                          {notification.titulo}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {formatarData(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {notification.mensagem}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}