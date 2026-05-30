import { createClient } from '@supabase/supabase-js';

/**
 * CLIENTE DE ADMINISTRAÇÃO (BACKEND)
 * Este arquivo usa a service_role key para ter acesso total ao banco de dados.
 * Nunca utilize este arquivo em componentes de cliente (frontend).
 */

const supabaseUrl = 'https://eahwyotzbskfjvqsoqzw.supabase.co';
const supabaseServiceKey = 'sb_secret_0CEjKzEYhO1kfWZC1iJnow_HKZdDTYL';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
