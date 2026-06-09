-- ============================================
-- PASSO 2: ATIVAR LEMBRETES AUTOMÁTICOS
-- Requer: pg_cron habilitado no Supabase
-- (Settings > Database > Extensions > pg_cron)
-- ============================================

-- 1. Ativar extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Agendar verificação diária às 8h BRT
SELECT cron.schedule(
  'invoice-reminders',
  '0 11 * * *',   -- 11h UTC = 8h BRT
  $$SELECT check_invoice_reminders()$$
);
