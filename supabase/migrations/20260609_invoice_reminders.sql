-- ============================================
-- LEMBRETES AUTOMÁTICOS DE FATURA
-- ============================================
-- Cria notificações para faturas próximas do vencimento
-- Pode ser agendado via pg_cron ou chamado manualmente
-- ============================================

CREATE OR REPLACE FUNCTION check_invoice_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    SELECT
        i.user_id,
        'warning',
        CASE
            WHEN i.vencimento::date = CURRENT_DATE THEN 'Fatura vence hoje!'
            WHEN i.vencimento::date = CURRENT_DATE + 1 THEN 'Fatura vence amanhã!'
            ELSE 'Fatura próxima do vencimento'
        END,
        CASE
            WHEN i.vencimento::date = CURRENT_DATE THEN 'Sua conta de energia no valor de R$ ' || ROUND(i.valor_total::numeric, 2)::text || ' vence hoje. Não deixe para depois!'
            WHEN i.vencimento::date = CURRENT_DATE + 1 THEN 'Sua conta de energia no valor de R$ ' || ROUND(i.valor_total::numeric, 2)::text || ' vence amanhã.'
            ELSE 'Sua conta de energia no valor de R$ ' || ROUND(i.valor_total::numeric, 2)::text || ' vence em ' || (i.vencimento::date - CURRENT_DATE)::text || ' dias.'
        END,
        '/dashboard/faturas/' || i.id,
        jsonb_build_object('invoice_id', i.id, 'vencimento', i.vencimento, 'valor', i.valor_total)
    FROM invoice_uploads i
    WHERE i.status = 'analyzed'
      AND i.vencimento IS NOT NULL
      AND i.vencimento::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 3
      AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = i.user_id
            AND n.metadata->>'invoice_id' = i.id::text
            AND n.type = 'warning'
            AND n.created_at::date >= CURRENT_DATE - 1
      );
END;
$$;

-- Agendar execução diária às 8h (requer pg_cron habilitado no Supabase)
-- SELECT cron.schedule('invoice-reminders', '0 8 * * *', 'SELECT check_invoice_reminders()');

-- Comentário:
-- Para ativar o agendamento automático, execute no Supabase SQL Editor:
--   1. CREATE EXTENSION IF NOT EXISTS pg_cron;
--   2. SELECT cron.schedule('invoice-reminders', '0 8 * * *', 'SELECT check_invoice_reminders()');
-- Ou chame manualmente: SELECT check_invoice_reminders();
