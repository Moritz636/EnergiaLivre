#!/usr/bin/env bash
# ============================================================
# Configura SMTP customizado (Resend) no Supabase via Management API
# BYPASSA o rate limit de 2/hora (vai para o limite do Resend)
# ============================================================

set -euo pipefail

# ---- CONFIGURAR ANTES DE EXECUTAR ----
PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
RESEND_API_KEY="${RESEND_API_KEY:-}"   # re_xxxxxxxxx
SMTP_HOST="${SMTP_HOST:-smtp.resend.com}"
SMTP_PORT="${SMTP_PORT:-465}"
SMTP_USER="${SMTP_USER:-resend}"
SENDER_NAME="${SENDER_NAME:-EnergiaLivre}"
SENDER_EMAIL="${SENDER_EMAIL:-noreply@energialivre.dev.br}"

if [[ -z "$PROJECT_REF" || -z "$ACCESS_TOKEN" || -z "$RESEND_API_KEY" ]]; then
  echo "❌ Defina SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN e RESEND_API_KEY"
  echo "   export SUPABASE_PROJECT_REF='abcdefghij'"
  echo "   export SUPABASE_ACCESS_TOKEN='sbp_...'"
  echo "   export RESEND_API_KEY='re_...'"
  exit 1
fi

API="https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth"

echo "🔍 [1/3] Lendo config atual..."
curl -sS -X GET "$API" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  | python -c "import json,sys; d=json.load(sys.stdin); print('  smtp_host:', d.get('smtp_host')); print('  smtp_admin_email:', d.get('smtp_admin_email')); print('  mailer_autoconfirm:', d.get('mailer_autoconfirm'))"

echo ""
echo "✏️  [2/3] Atualizando SMTP + sender..."
PAYLOAD=$(cat <<JSON
{
  "smtp_host": "$SMTP_HOST",
  "smtp_port": $SMTP_PORT,
  "smtp_user": "$SMTP_USER",
  "smtp_pass": "$RESEND_API_KEY",
  "smtp_sender_name": "$SENDER_NAME",
  "smtp_admin_email": "$SENDER_EMAIL",
  "mailer_secure_email_change_enabled": true
}
JSON
)

HTTP_CODE=$(curl -sS -o /tmp/supabase_smtp_response.json -w "%{http_code}" \
  -X PATCH "$API" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "  ✅ SMTP atualizado (HTTP $HTTP_CODE)"
else
  echo "  ❌ Falha (HTTP $HTTP_CODE):"
  cat /tmp/supabase_smtp_response.json
  exit 1
fi

echo ""
echo "🧪 [3/3] Verificando config aplicada..."
curl -sS -X GET "$API" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  | python -c "
import json, sys
d = json.load(sys.stdin)
ok = (
  d.get('smtp_host') == '$SMTP_HOST'
  and d.get('smtp_port') == $SMTP_PORT
  and d.get('smtp_user') == '$SMTP_USER'
  and d.get('smtp_admin_email') == '$SENDER_EMAIL'
)
print('  smtp_host:', d.get('smtp_host'))
print('  smtp_port:', d.get('smtp_port'))
print('  smtp_user:', d.get('smtp_user'))
print('  smtp_admin_email:', d.get('smtp_admin_email'))
print('  smtp_pass set:', 'sim' if d.get('smtp_pass') else 'NÃO')
print('')
print('  ✅ TUDO OK' if ok else '  ⚠️ Config incompleta — revise')
"

echo ""
echo "📧 PRÓXIMO PASSO: teste criando uma conta nova em /cadastro"
echo "   → verifique se o email chega em < 30s"
echo "   → checar logs: https://supabase.com/dashboard/project/$PROJECT_REF/logs/auth"
