// hooks/useAuth.ts - OTIMIZADO PARA ESCALA
'use client';
import { getSupabase } from '@/lib/supabase/singleton';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabase();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (!mountedRef.current) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
          } else if (session?.user) {
            setUser(session.user);
          }
        }
        setLoading(false);
      }
    );

    async function loadProfile(userId: string) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (mountedRef.current) {
          if (!error && data) {
            const profileData = data as Profile
            setProfile(profileData);
            setIsAdmin(profileData.role === 'admin');
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error('Profile load error:', err);
      }
    }

    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!mountedRef.current) return;
      setUser(authUser);
      if (authUser) {
        await loadProfile(authUser.id);
      }
      setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error && profileData) {
        const next = profileData as Profile
        setProfile(next);
        setIsAdmin(next.role === 'admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('Não autenticado');
    const { error } = await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
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
    updateProfile,
    isAuthenticated: !!user,
    isConsumer: profile?.tipo === 'consumidor',
    isGenerator: profile?.tipo === 'gerador',
    isPartner: profile?.tipo === 'parceiro',
  };
}

export function useAdminAuth() {
  const { user, profile, loading, isAdmin, logout, refresh } = useAuth();
  return {
    user,
    profile,
    loading,
    isAdmin,
    logout,
    refresh,
    isAdminRoute: isAdmin && !loading,
  };
}

export function useAuthRedirect() {
  const { user, profile, loading } = useAuth();
  if (loading) return { loading: true, canAccess: false };
  if (!user) return { loading: false, canAccess: false, redirect: '/login' };
  if (profile?.tipo === 'gerador') return { loading: false, canAccess: true, redirect: '/dashboard-gerador' };
  if (profile?.tipo === 'parceiro') return { loading: false, canAccess: true, redirect: '/embaixador/dashboard' };
  return { loading: false, canAccess: true, redirect: '/dashboard-consumidor' };
}

export function useEmbaixadorAuth() {
  const { user, profile, loading, isAdmin, logout, refresh, updateProfile, isAuthenticated, isConsumer, isGenerator, isPartner } = useAuth();
  return {
    user,
    profile,
    loading,
    isAdmin,
    logout,
    refresh,
    updateProfile,
    isAuthenticated,
    isEmbaixador: isAdmin || isGenerator || isPartner,
    embaixadorData: isAdmin ? profile : null,
  };
}
