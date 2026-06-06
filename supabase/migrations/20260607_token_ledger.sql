-- =============================================================
-- 20260607_token_ledger.sql
-- KWATT Token — Ledger, Holdings, Redemptions, Airdrops
-- Adiciona infraestrutura completa de ledger on-chain.
-- Não mexe nas tabelas existentes.
-- =============================================================

-- =============================================================
-- 1. token_holdings — Cache de saldo por usuario (off-chain mirror)
-- =============================================================
CREATE TABLE IF NOT EXISTS token_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_address text,
  balance numeric(30, 8) NOT NULL DEFAULT 0,
  balance_locked numeric(30, 8) NOT NULL DEFAULT 0,
  balance_available numeric(30, 8) GENERATED ALWAYS AS (balance - balance_locked) STORED,
  lifetime_earned numeric(30, 8) NOT NULL DEFAULT 0,
  lifetime_burned numeric(30, 8) NOT NULL DEFAULT 0,
  lifetime_transferred_in numeric(30, 8) NOT NULL DEFAULT 0,
  lifetime_transferred_out numeric(30, 8) NOT NULL DEFAULT 0,
  last_synced_at timestamptz,
  last_synced_block bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_token_holdings_user ON token_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_token_holdings_wallet ON token_holdings(wallet_address);
COMMENT ON TABLE token_holdings IS 'Cache off-chain de saldos KWATT. Fonte da verdade eh o smart contract; este espelho eh refrescado via cron/webhook.';

-- =============================================================
-- 2. token_transactions — Ledger completo de movimentacoes
-- =============================================================
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tx_hash text,
  block_number bigint,
  log_index integer,
  tx_type text NOT NULL,
  amount numeric(30, 8) NOT NULL,
  direction text NOT NULL,
  counterparty_user_id uuid REFERENCES auth.users(id),
  counterparty_wallet text,
  purpose text,
  ref_id text,
  ref_table text,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT token_tx_direction_check CHECK (direction IN ('in','out','self')),
  CONSTRAINT token_tx_status_check CHECK (status IN ('pending','confirmed','failed','reverted'))
);

CREATE INDEX IF NOT EXISTS idx_token_tx_user ON token_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_tx_hash ON token_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_token_tx_type ON token_transactions(tx_type);
CREATE INDEX IF NOT EXISTS idx_token_tx_status ON token_transactions(status);
CREATE INDEX IF NOT EXISTS idx_token_tx_ref ON token_transactions(ref_table, ref_id);
COMMENT ON TABLE token_transactions IS 'Ledger append-only de todas as movimentacoes de tokens (mint, burn, transfer, redeem, cashback, referral).';

-- =============================================================
-- 3. token_redemptions — Burn-to-redeem (fatura, recarga, cashback)
-- =============================================================
CREATE TABLE IF NOT EXISTS token_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  redemption_type text NOT NULL,
  amount_tokens numeric(30, 8) NOT NULL,
  amount_brl numeric(15, 2) NOT NULL,
  kwh_equivalent numeric(15, 2),
  target_id text,
  target_type text,
  target_metadata jsonb DEFAULT '{}'::jsonb,
  tx_hash text,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  rejected_reason text,
  fulfilled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT token_redemption_type_check CHECK (redemption_type IN ('invoice_payment','celular_recharge','cashback','donation','other')),
  CONSTRAINT token_redemption_status_check CHECK (status IN ('pending','approved','processing','fulfilled','rejected','failed','refunded'))
);

CREATE INDEX IF NOT EXISTS idx_token_redemptions_user ON token_redemptions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_redemptions_type ON token_redemptions(redemption_type);
CREATE INDEX IF NOT EXISTS idx_token_redemptions_status ON token_redemptions(status);
COMMENT ON TABLE token_redemptions IS 'Historico de resgates (queima de tokens em troca de beneficio real: fatura, recarga, etc).';

-- =============================================================
-- 4. token_airdrops — Rastreamento de distribuicao on-chain
-- =============================================================
CREATE TABLE IF NOT EXISTS token_airdrops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_registration_id uuid REFERENCES token_pre_registrations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  wallet_address text,
  amount numeric(30, 8) NOT NULL,
  package_code text,
  source text NOT NULL DEFAULT 'presale',
  tx_hash text,
  status text NOT NULL DEFAULT 'pending',
  attempted_at timestamptz,
  confirmed_at timestamptz,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT token_airdrop_status_check CHECK (status IN ('pending','queued','sent','confirmed','failed','rejected'))
);

CREATE INDEX IF NOT EXISTS idx_token_airdrops_user ON token_airdrops(user_id);
CREATE INDEX IF NOT EXISTS idx_token_airdrops_wallet ON token_airdrops(wallet_address);
CREATE INDEX IF NOT EXISTS idx_token_airdrops_prereg ON token_airdrops(pre_registration_id);
CREATE INDEX IF NOT EXISTS idx_token_airdrops_status ON token_airdrops(status);
CREATE INDEX IF NOT EXISTS idx_token_airdrops_tx ON token_airdrops(tx_hash);
COMMENT ON TABLE token_airdrops IS 'Fila de airdrops de tokens para carteiras de pre-registro e recompensas.';

-- =============================================================
-- 5. token_contracts — Tabela de configuracao on-chain
-- =============================================================
CREATE TABLE IF NOT EXISTS token_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network text NOT NULL,
  chain_id bigint NOT NULL,
  contract_address text NOT NULL,
  deploy_tx_hash text,
  deploy_block bigint,
  deployer_address text,
  name text NOT NULL,
  symbol text NOT NULL,
  decimals integer NOT NULL DEFAULT 18,
  is_active boolean NOT NULL DEFAULT true,
  verified_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chain_id, contract_address)
);

CREATE INDEX IF NOT EXISTS idx_token_contracts_active ON token_contracts(is_active, chain_id);
COMMENT ON TABLE token_contracts IS 'Cadastro de contratos KWATT deployados (permite mainnet + testnets simultaneos).';

-- Inserir placeholder do contract (sera atualizado quando deployar)
INSERT INTO token_contracts (network, chain_id, contract_address, name, symbol, decimals, is_active, metadata)
VALUES
  ('polygon-mainnet', 137, '0x0000000000000000000000000000000000000000', 'KWATT', 'KWATT', 18, false, '{"status":"not_deployed","planned_launch":"2027-01-05"}'::jsonb),
  ('polygon-amoy', 80002, '0x0000000000000000000000000000000000000000', 'KWATT', 'KWATT', 18, false, '{"status":"not_deployed","purpose":"testnet"}'::jsonb)
ON CONFLICT (chain_id, contract_address) DO NOTHING;

-- =============================================================
-- 6. RLS — habilitar policies basicas
-- =============================================================
ALTER TABLE token_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_airdrops ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_contracts ENABLE ROW LEVEL SECURITY;

-- Policies: user ve apenas seus proprios dados
DROP POLICY IF EXISTS token_holdings_user_select ON token_holdings;
CREATE POLICY token_holdings_user_select ON token_holdings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS token_tx_user_select ON token_transactions;
CREATE POLICY token_tx_user_select ON token_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS token_redemptions_user_select ON token_redemptions;
CREATE POLICY token_redemptions_user_select ON token_redemptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS token_airdrops_user_select ON token_airdrops;
CREATE POLICY token_airdrops_user_select ON token_airdrops FOR SELECT USING (auth.uid() = user_id OR email = auth.jwt() ->> 'email');

-- token_contracts eh publico para leitura
DROP POLICY IF EXISTS token_contracts_public_select ON token_contracts;
CREATE POLICY token_contracts_public_select ON token_contracts FOR SELECT USING (true);

-- =============================================================
-- 7. Trigger: updated_at automatico
-- =============================================================
DROP TRIGGER IF EXISTS trg_token_holdings_updated_at ON token_holdings;
CREATE TRIGGER trg_token_holdings_updated_at BEFORE UPDATE ON token_holdings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_token_redemptions_updated_at ON token_redemptions;
CREATE TRIGGER trg_token_redemptions_updated_at BEFORE UPDATE ON token_redemptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_token_airdrops_updated_at ON token_airdrops;
CREATE TRIGGER trg_token_airdrops_updated_at BEFORE UPDATE ON token_airdrops
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_token_contracts_updated_at ON token_contracts;
CREATE TRIGGER trg_token_contracts_updated_at BEFORE UPDATE ON token_contracts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- set_updated_at() deve ja existir (funcao utilitaria do projeto).
-- Se nao existir, criar:
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- 8. RPC utilitaria: snapshot rapido de metricas publicas
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_token_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_holders integer;
  v_total_distributed numeric(30, 8);
  v_total_burned numeric(30, 8);
  v_total_redemptions integer;
  v_total_redemption_brl numeric(15, 2);
  v_active_contract record;
BEGIN
  SELECT contract_address, chain_id, network
    INTO v_active_contract
    FROM token_contracts
   WHERE is_active = true
   ORDER BY chain_id ASC
   LIMIT 1;

  SELECT count(*)::integer,
         coalesce(sum(balance), 0)
    INTO v_total_holders, v_total_distributed
    FROM token_holdings
   WHERE balance > 0;

  SELECT coalesce(sum(lifetime_burned), 0)
    INTO v_total_burned
    FROM token_holdings;

  SELECT count(*)::integer,
         coalesce(sum(amount_brl), 0)
    INTO v_total_redemptions, v_total_redemption_brl
    FROM token_redemptions
   WHERE status = 'fulfilled';

  RETURN json_build_object(
    'contract_address', coalesce(v_active_contract.contract_address, '0x0000000000000000000000000000000000000000'),
    'chain_id', v_active_contract.chain_id,
    'network', v_active_contract.network,
    'total_holders', v_total_holders,
    'total_distributed', v_total_distributed,
    'total_burned', v_total_burned,
    'total_redemptions', v_total_redemptions,
    'total_redemption_brl', v_total_redemption_brl,
    'launch_date', '2027-01-05',
    'as_of', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_token_metrics() TO anon, authenticated;

-- =============================================================
-- 9. RPC: ledger do usuario
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_user_token_ledger(p_user_id uuid, p_limit integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  tx_type text,
  direction text,
  amount numeric,
  purpose text,
  status text,
  tx_hash text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.tx_type, t.direction, t.amount, t.purpose, t.status, t.tx_hash, t.created_at
    FROM token_transactions t
   WHERE t.user_id = p_user_id
   ORDER BY t.created_at DESC
   LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_token_ledger(uuid, integer) TO authenticated;

-- =============================================================
-- FIM
-- =============================================================
