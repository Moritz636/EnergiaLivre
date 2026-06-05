// ============================================
// TIPOS DO SISTEMA DE MOEDAS ENERGIALIVRE
// ============================================
// Espelha os tipos definidos na migration 20260107_coin_system.sql.
// ============================================

export type CoinTransactionType =
  | 'purchase'
  | 'consume'
  | 'refund'
  | 'bonus'
  | 'admin_adjust';

export interface CoinPackage {
  id: number;
  code: string;
  name: string;
  description: string | null;
  coins: number;
  price_cents: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CoinWallet {
  user_id: string;
  balance: number;
  lifetime_bought: number;
  lifetime_spent: number;
  lifetime_refunded: number;
  created_at: string;
  updated_at: string;
}

export interface CoinTransaction {
  id: number;
  user_id: string;
  type: CoinTransactionType;
  amount: number;
  balance_after: number;
  reason: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  coin_package_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ============================================
// CONSTANTES DE NEGÓCIO
// ============================================
// 1 moeda = R$ 0,70
//   Base  : tarifa média residencial ANEEL ≈ R$ 0,78/kWh
//   Modelo: 10% de DESCONTO sobre a tarifa de rede
//   Intenção: a plataforma é mais barata que a rede
//             convencional, incentivando geradores a usar.
// Documentado em /docs/coin-economics.md (TODO)
export const COIN_VALUE_BRL = 0.70;

// Labels amigáveis para cada tipo de transação
export const TRANSACTION_TYPE_LABELS: Record<CoinTransactionType, string> = {
  purchase: 'Compra de pacote',
  consume: 'Consumo de plataforma',
  refund: 'Reembolso',
  bonus: 'Bônus',
  admin_adjust: 'Ajuste administrativo',
};
