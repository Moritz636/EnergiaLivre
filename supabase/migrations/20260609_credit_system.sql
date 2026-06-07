-- ============================================================
-- 20260609_credit_system.sql
-- ------------------------------------------------------------
-- Sistema de créditos interno (Fase 1 — manual via API admin).
--   • Consumidores compram créditos para pagar energia.
--   • Geradores recebem créditos pela energia fornecida.
--   • Embaixadores recebem comissões em créditos.
--   • Admin credita manualmente após confirmar Pix (Fase 1).
--   • Futuras fases: webhook automático Asaas/MercadoPago.
-- ============================================================

-- ============================================================
-- 1. TABELA user_credits (1:1 com profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_credits_balance
  ON user_credits(balance DESC);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. TABELA credit_transactions (histórico/auditoria)
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL, -- positivo=entrada, negativo=saída
  type TEXT NOT NULL CHECK (type IN (
    'purchase',      -- usuário comprou créditos (admin creditou após Pix)
    'commission',    -- embaixador ganhou comissão
    'refund',        -- estorno
    'admin_credit',  -- admin creditou manualmente
    'admin_debit',   -- admin debitou manualmente (estorno/correção)
    'payment',       -- usuário pagou algo com saldo
    'transfer_in',   -- recebeu de outro usuário
    'transfer_out',  -- enviou para outro usuário
    'bonus',         -- bônus promocional
    'cashback'       -- cashback (ex: recarga de celular)
  )),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
    'pending', 'completed', 'failed', 'cancelled'
  )),
  description TEXT,
  admin_id UUID REFERENCES profiles(id),
  counterparty_user_id UUID REFERENCES profiles(id), -- em transferências
  payment_proof_url TEXT,
  external_reference TEXT, -- ID do gateway (futuro)
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
  ON credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type
  ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status
  ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at
  ON credit_transactions(created_at DESC);

DROP TRIGGER IF EXISTS update_credit_transactions_updated_at ON credit_transactions;
CREATE TRIGGER update_credit_transactions_updated_at
  BEFORE UPDATE ON credit_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. RLS — Row Level Security
-- ============================================================
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- user_credits: usuário lê apenas o próprio saldo.
DROP POLICY IF EXISTS "user_view_own_balance" ON user_credits;
CREATE POLICY "user_view_own_balance" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- user_credits: admin pode ler/inserir/atualizar todos.
DROP POLICY IF EXISTS "admin_all_user_credits" ON user_credits;
CREATE POLICY "admin_all_user_credits" ON user_credits
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- credit_transactions: usuário lê apenas as próprias transações.
DROP POLICY IF EXISTS "user_view_own_transactions" ON credit_transactions;
CREATE POLICY "user_view_own_transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- credit_transactions: admin lê todas.
DROP POLICY IF EXISTS "admin_view_all_transactions" ON credit_transactions;
CREATE POLICY "admin_view_all_transactions" ON credit_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- credit_transactions: admin insere (para registrar créditos manuais).
DROP POLICY IF EXISTS "admin_insert_transactions" ON credit_transactions;
CREATE POLICY "admin_insert_transactions" ON credit_transactions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 4. FUNÇÕES SQL
-- ============================================================

-- 4.1 get_user_balance(p_user_id) — consulta pública do saldo
DROP FUNCTION IF EXISTS get_user_balance(UUID);
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id UUID)
RETURNS DECIMAL(12,2)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(balance, 0) FROM user_credits WHERE user_id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION get_user_balance(UUID) TO authenticated, anon;

-- 4.2 credit_user(p_user_id, p_amount, p_type, p_description, p_admin_id, p_metadata)
-- Credita (ou debita) valor ao usuário. Cria/atualiza user_credits.
-- amount deve ser positivo para crédito, negativo para débito.
DROP FUNCTION IF EXISTS credit_user(UUID, DECIMAL, TEXT, TEXT, UUID, JSONB);
CREATE OR REPLACE FUNCTION credit_user(
  p_user_id UUID,
  p_amount DECIMAL,
  p_type TEXT DEFAULT 'admin_credit',
  p_description TEXT DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE(new_balance DECIMAL, transaction_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance DECIMAL(12,2);
  v_new_balance DECIMAL(12,2);
  v_tx_id UUID;
BEGIN
  -- Validação
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id é obrigatório';
  END IF;
  IF p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'amount deve ser diferente de zero';
  END IF;
  IF p_type NOT IN (
    'purchase','commission','refund','admin_credit','admin_debit',
    'payment','transfer_in','transfer_out','bonus','cashback'
  ) THEN
    RAISE EXCEPTION 'type inválido: %', p_type;
  END IF;

  -- Lock da linha para evitar race conditions
  SELECT balance INTO v_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    -- Cria o registro se não existir
    INSERT INTO user_credits (user_id, balance)
    VALUES (p_user_id, GREATEST(p_amount, 0))
    RETURNING balance INTO v_new_balance;
  ELSE
    v_new_balance := v_balance + p_amount;
    IF v_new_balance < 0 THEN
      RAISE EXCEPTION 'Saldo insuficiente. Saldo atual: R$ %, débito: R$ %',
        v_balance, ABS(p_amount);
    END IF;
    UPDATE user_credits
    SET balance = v_new_balance
    WHERE user_id = p_user_id;
  END IF;

  -- Insere transação
  INSERT INTO credit_transactions (
    user_id, amount, type, status, description, admin_id, metadata
  )
  VALUES (
    p_user_id, p_amount, p_type, 'completed', p_description, p_admin_id, p_metadata
  )
  RETURNING id INTO v_tx_id;

  RETURN QUERY SELECT v_new_balance, v_tx_id;
END;
$$;

GRANT EXECUTE ON FUNCTION credit_user(UUID, DECIMAL, TEXT, TEXT, UUID, JSONB) TO authenticated;

-- 4.3 transfer_credits(p_from, p_to, p_amount, p_description)
-- Transfere entre dois usuários atomicamente.
DROP FUNCTION IF EXISTS transfer_credits(UUID, UUID, DECIMAL, TEXT);
CREATE OR REPLACE FUNCTION transfer_credits(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount DECIMAL,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(from_balance DECIMAL, to_balance DECIMAL, transfer_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_balance DECIMAL(12,2);
  v_to_balance DECIMAL(12,2);
  v_tx_out UUID;
  v_tx_in UUID;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'amount deve ser positivo';
  END IF;
  IF p_from_user_id = p_to_user_id THEN
    RAISE EXCEPTION 'origem e destino devem ser diferentes';
  END IF;

  -- Lock ambos os registros
  SELECT balance INTO v_from_balance
  FROM user_credits WHERE user_id = p_from_user_id FOR UPDATE;
  SELECT balance INTO v_to_balance
  FROM user_credits WHERE user_id = p_to_user_id FOR UPDATE;

  IF v_from_balance IS NULL OR v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente para transferência';
  END IF;

  -- Débito origem
  UPDATE user_credits
  SET balance = balance - p_amount
  WHERE user_id = p_from_user_id
  RETURNING balance INTO v_from_balance;

  -- Crédito destino (cria se não existir)
  IF v_to_balance IS NULL THEN
    INSERT INTO user_credits (user_id, balance) VALUES (p_to_user_id, p_amount)
    RETURNING balance INTO v_to_balance;
  ELSE
    UPDATE user_credits
    SET balance = balance + p_amount
    WHERE user_id = p_to_user_id
    RETURNING balance INTO v_to_balance;
  END IF;

  -- Tx saída
  INSERT INTO credit_transactions (
    user_id, amount, type, status, description, counterparty_user_id
  )
  VALUES (
    p_from_user_id, -p_amount, 'transfer_out', 'completed',
    p_description, p_to_user_id
  )
  RETURNING id INTO v_tx_out;

  -- Tx entrada (mesmo external_reference)
  INSERT INTO credit_transactions (
    user_id, amount, type, status, description,
    counterparty_user_id, external_reference
  )
  VALUES (
    p_to_user_id, p_amount, 'transfer_in', 'completed',
    p_description, p_from_user_id, v_tx_out::TEXT
  )
  RETURNING id INTO v_tx_in;

  RETURN QUERY SELECT v_from_balance, v_to_balance, v_tx_out;
END;
$$;

GRANT EXECUTE ON FUNCTION transfer_credits(UUID, UUID, DECIMAL, TEXT) TO authenticated;

-- ============================================================
-- 5. COMENTÁRIOS
-- ============================================================
COMMENT ON TABLE user_credits IS
  'Saldo interno de créditos de cada usuário. Escrita via credit_user/transfer_credits.';
COMMENT ON TABLE credit_transactions IS
  'Ledger append-only de movimentações de crédito. Auditável.';
COMMENT ON FUNCTION credit_user IS
  'Credita (+) ou debita (-) créditos de um usuário. Cria user_credits se não existir. Valida saldo.';
COMMENT ON FUNCTION transfer_credits IS
  'Transfere créditos entre 2 usuários atomicamente. Lock + tx dual (out/in).';
COMMENT ON FUNCTION get_user_balance IS
  'Retorna o saldo atual (0 se sem registro). Público via SECURITY DEFINER.';
