// hooks/useAuth.ts - UNIFICADO
'use client';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Database } from '@/lib/database.types';

interface UserProfile {
  id: string;
  email: string;
  nome?: string;
  tipo?: 'consumidor' | 'gerador' | 'admin';
  role?: 'admin' | 'user';
  cidade?: string;
  estado?: string;
  whatsapp?: string;
  created_at: string;
}

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sessão do usuário
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          if (pathname !== '/login' && pathname !== '/admin-login') {
            const url = new URL('/login', window.location.origin);
            url.searchParams.set('redirect', pathname);
            router.push(url.toString());
          }
          setLoading(false);
          return;
        }

        // Buscar perfil completo
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          // Criar perfil se não existir
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              email: authUser.email,
              nome: authUser.user_metadata?.nome || authUser.email?.split('@')[0],
              tipo: authUser.user_metadata?.tipo || 'consumidor',
              role: 'user',
              whatsapp: authUser.user_metadata?.whatsapp || '',
              cidade: authUser.user_metadata?.cidade || '',
              estado: authUser.user_metadata?.estado || ''
            })
            .select()
            .single();
          
          setProfile(newProfile);
          setUser(authUser);
          setIsAdmin(newProfile.role === 'admin');
        } else {
          setProfile(profileData);
          setUser(authUser);
          setIsAdmin(profileData.role === 'admin');
        }

        // Redirecionar baseado no tipo de usuário (Lei 6: Chame atenção)
        if (pathname === '/dashboard') {
          if (profileData?.tipo === 'gerador') {
            router.replace('/dashboard-gerador');
          } else {
            router.replace('/dashboard-consumidor');
          }
        }

        // Proteger rotas admin
        if (pathname.startsWith('/admin') && profileData?.role !== 'admin') {
          router.replace('/');
        }

      } catch (error) {
        console.error('Auth check error:', error);
        if (pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    router.push('/');
  };

  const refresh = async () => {
    setLoading(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      setUser(authUser);
      setProfile(profileData);
      setIsAdmin(profileData?.role === 'admin');
    }
    
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user?.id);

    if (error) throw error;
    
    // Atualizar local state
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    return true;
  };

  return {
    user,
    profile,
    loading,
    isAdmin,
    logout,
    refresh,
    isAuthenticated: !!user,
    isConsumer: profile?.tipo === 'consumidor',
    isGenerator: profile?.tipo === 'gerador',
    updateProfile,
  };
}

// Hook para componentes de admin
export function useAdminAuth() {
  const { user, profile, loading, isAdmin, logout, refresh } = useAuth();
  
  return {
    user,
    profile,
    loading,
    isAdmin,
    logout,
    refresh,
    isAdminRoute: isAdmin && !loading
  };
}

// Hook para redirecionamento automático
export function useAuthRedirect() {
  const { user, profile, loading } = useAuth();
  
  if (loading) return { loading: true, canAccess: false };
  
  if (!user) return { loading: false, canAccess: false, redirect: '/login' };
  
  return { 
    loading: false, 
    canAccess: true,
    redirect: profile?.tipo === 'gerador' ? '/dashboard-gerador' : '/dashboard-consumidor'
  };
}

// Hook para embaixadores
export function useEmbaixadorAuth() {
  const { user, profile, loading, isAdmin, ...rest } = useAuth();
  
  return {
    ...rest,
    user,
    profile,
    loading,
    isAdmin,
    isEmbaixador: profile?.role === 'admin' || profile?.tipo === 'gerador',
    embaixadorData: isAdmin ? profile : null,
  };
}


