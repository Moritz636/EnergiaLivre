import { createClient } from '@supabase/supabase-js';

// CTO Note: Verifique se estas chaves batem com o seu painel do Supabase
const supabaseUrl = 'https://eahwyotzbskfjvqsoqzw.supabase.co';
const supabaseAnonKey = 'sb_publishable_2Lufs_bj2ZqmCjcweEb08w_qPPoCC6y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
