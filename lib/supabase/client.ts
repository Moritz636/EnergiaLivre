import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // O código agora busca as chaves nas Variáveis de Ambiente da Vercel
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Verificação de segurança: Se as chaves não existirem, ele avisa no console
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '❌ ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas! ' +
      'Verifique o painel da Vercel em Settings -> Environment Variables.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
