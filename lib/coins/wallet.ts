// ============================================
// HELPERS DE MOEDAS (SERVER-SIDE)
// ============================================
// Funções que rodam no servidor (API routes, server components)
// para ler dados de pacotes, wallet e histórico.
// Escrita é feita EXCLUSIVAMENTE via RPC credit_wallet/debit_wallet
// (definidos na migration 20260107_coin_system.sql).
// ============================================

import { createClient } from '@/lib/supabase/server';
import type {
  CoinPackage,
  CoinTransaction,
  CoinWallet,
} from './types';

export async function getPackageByCode(
  code: string
): Promise<CoinPackage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('coin_packages')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as CoinPackage;
}

export async function getPackageById(
  id: number
): Promise<CoinPackage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('coin_packages')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as CoinPackage;
}

export async function listActivePackages(): Promise<CoinPackage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('coin_packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as CoinPackage[];
}

export async function getWallet(userId: string): Promise<CoinWallet | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('coin_wallet')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as CoinWallet;
}

export async function getHistory(
  userId: string,
  limit = 50
): Promise<CoinTransaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('coin_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as CoinTransaction[];
}

export async function getBalance(userId: string): Promise<number> {
  const wallet = await getWallet(userId);
  return wallet?.balance ?? 0;
}
