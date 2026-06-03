export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          nome: string
          tipo: 'consumidor' | 'gerador' | 'admin'
          role: 'user' | 'admin'
          whatsapp: string
          cidade: string
          estado: string
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          nome: string
          tipo: 'consumidor' | 'gerador' | 'admin'
          role?: 'user' | 'admin'
          whatsapp?: string
          cidade?: string
          estado?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          nome?: string
          tipo?: 'consumidor' | 'gerador' | 'admin'
          role?: 'user' | 'admin'
          whatsapp?: string
          cidade?: string
          estado?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
      }
      leads: {
        Row: {
          id: number
          user_id: string | null
          nome: string
          email: string
          whatsapp: string
          cidade: string
          estado: string
          tipo: 'consumidor' | 'gerador'
          capacidade_kwp: number | null
          gasto_mensal: number | null
          concessionaria: string | null
          status: 'pendente' | 'aprovado' | 'recusado'
          created_at: string
          updated_at: string
          processed_at: string | null
          processed_by: string | null
          observacoes: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          nome: string
          email: string
          whatsapp: string
          cidade: string
          estado: string
          tipo: 'consumidor' | 'gerador'
          capacidade_kwp?: number | null
          gasto_mensal?: number | null
          concessionaria?: string | null
          status?: 'pendente' | 'aprovado' | 'recusado'
          created_at?: string
          updated_at?: string
          processed_at?: string | null
          processed_by?: string | null
          observacoes?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          nome?: string
          email?: string
          whatsapp?: string
          cidade?: string
          estado?: string
          tipo?: 'consumidor' | 'gerador'
          capacidade_kwp?: number | null
          gasto_mensal?: number | null
          concessionaria?: string | null
          status?: 'pendente' | 'aprovado' | 'recusado'
          created_at?: string
          updated_at?: string
          processed_at?: string | null
          processed_by?: string | null
          observacoes?: string | null
        }
      }
      geradores: {
        Row: {
          id: string
          nome_usina: string
          capacidade_kwp: number
          excedente_mensal_kwh: number
          concessionaria: string
          cidade: string
          estado: string
          endereco: string | null
          latitude: number | null
          longitude: number | null
          status: 'pendente' | 'aprovado' | 'ativo' | 'inativo'
          data_aprovacao: string | null
          lucro_total: number
          kwh_vendidos_total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome_usina: string
          capacidade_kwp: number
          excedente_mensal_kwh: number
          concessionaria: string
          cidade: string
          estado: string
          endereco?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: 'pendente' | 'aprovado' | 'ativo' | 'inativo'
          data_aprovacao?: string | null
          lucro_total?: number
          kwh_vendidos_total?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_usina?: string
          capacidade_kwp?: number
          excedente_mensal_kwh?: number
          concessionaria?: string
          cidade?: string
          estado?: string
          endereco?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: 'pendente' | 'aprovado' | 'ativo' | 'inativo'
          data_aprovacao?: string | null
          lucro_total?: number
          kwh_vendidos_total?: number
          created_at?: string
          updated_at?: string
        }
      }
      consumidores: {
        Row: {
          id: string
          gasto_mensal: number
          economia_mensal: number
          economia_total: number
          kwh_consumidos: number
          co2_evitado_kg: number
          arvores_salvas: number
          plano_ativo: boolean
          data_primeira_assinatura: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          gasto_mensal: number
          economia_mensal?: number
          economia_total?: number
          kwh_consumidos?: number
          co2_evitado_kg?: number
          arvores_salvas?: number
          plano_ativo?: boolean
          data_primeira_assinatura?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gasto_mensal?: number
          economia_mensal?: number
          economia_total?: number
          kwh_consumidos?: number
          co2_evitado_kg?: number
          arvores_salvas?: number
          plano_ativo?: boolean
          data_primeira_assinatura?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assinaturas: {
        Row: {
          id: number
          user_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          nome_plano: string
          valor_mensal: number
          kwh_mensais: number
          economia_percentual: number
          status: 'active' | 'past_due' | 'canceled' | 'unpaid'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          trial_end: string | null
          created_at: string
          updated_at: string
          canceled_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          nome_plano: string
          valor_mensal: number
          kwh_mensais: number
          economia_percentual: number
          status?: 'active' | 'past_due' | 'canceled' | 'unpaid'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          trial_end?: string | null
          created_at?: string
          updated_at?: string
          canceled_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          stripe_subscription_id?: string
          stripe_price_id?: string
          nome_plano?: string
          valor_mensal?: number
          kwh_mensais?: number
          economia_percentual?: number
          status?: 'active' | 'past_due' | 'canceled' | 'unpaid'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          trial_end?: string | null
          created_at?: string
          updated_at?: string
          canceled_at?: string | null
        }
      }
      comissoes: {
        Row: {
          id: number
          embaixador_id: string
          cliente_id: string
          lead_id: number | null
          valor_comissao: number
          percentual: number
          tipo_comissao: 'cadastro' | 'recorrente'
          status_pagamento: 'pendente' | 'pago' | 'cancelado'
          data_pagamento: string | null
          stripe_payment_intent: string | null
          created_at: string
          updated_at: string
          mes_referencia: string
          ano_referencia: number
        }
        Insert: {
          id?: number
          embaixador_id: string
          cliente_id: string
          lead_id?: number | null
          valor_comissao: number
          percentual: number
          tipo_comissao: 'cadastro' | 'recorrente'
          status_pagamento?: 'pendente' | 'pago' | 'cancelado'
          data_pagamento?: string | null
          stripe_payment_intent?: string | null
          created_at?: string
          updated_at?: string
          mes_referencia: string
          ano_referencia: number
        }
        Update: {
          id?: number
          embaixador_id?: string
          cliente_id?: string
          lead_id?: number | null
          valor_comissao?: number
          percentual?: number
          tipo_comissao?: 'cadastro' | 'recorrente'
          status_pagamento?: 'pendente' | 'pago' | 'cancelado'
          data_pagamento?: string | null
          stripe_payment_intent?: string | null
          created_at?: string
          updated_at?: string
          mes_referencia?: string
          ano_referencia?: number
        }
      }
      pagamentos: {
        Row: {
          id: number
          user_id: string
          tipo_pagamento: 'assinatura' | 'comissao' | 'adicional'
          valor: number
          status: 'pending' | 'succeeded' | 'failed' | 'refunded'
          stripe_payment_intent: string | null
          stripe_charge_id: string | null
          description: string | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          tipo_pagamento: 'assinatura' | 'comissao' | 'adicional'
          valor: number
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded'
          stripe_payment_intent?: string | null
          stripe_charge_id?: string | null
          description?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          tipo_pagamento?: 'assinatura' | 'comissao' | 'adicional'
          valor?: number
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded'
          stripe_payment_intent?: string | null
          stripe_charge_id?: string | null
          description?: string | null
          created_at?: string
          processed_at?: string | null
        }
      }
      matches: {
        Row: {
          id: number
          gerador_id: string
          consumidor_id: string
          kwh_alocados: number
          valor_transacao: number
          status: 'active' | 'paused' | 'completed' | 'cancelled'
          data_inicio: string
          data_fim: string | null
          created_at: string
        }
        Insert: {
          id?: number
          gerador_id: string
          consumidor_id: string
          kwh_alocados: number
          valor_transacao: number
          status?: 'active' | 'paused' | 'completed' | 'cancelled'
          data_inicio?: string
          data_fim?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          gerador_id?: string
          consumidor_id?: string
          kwh_alocados?: number
          valor_transacao?: number
          status?: 'active' | 'paused' | 'completed' | 'cancelled'
          data_inicio?: string
          data_fim?: string | null
          created_at?: string
        }
      }
      relatorios: {
        Row: {
          id: number
          tipo_relatorio: 'financeiro' | 'operacional' | 'usuario'
          periodo: string
          dados: Json
          gerado_por: string | null
          created_at: string
        }
        Insert: {
          id?: number
          tipo_relatorio: 'financeiro' | 'operacional' | 'usuario'
          periodo: string
          dados: Json
          gerado_por?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          tipo_relatorio?: 'financeiro' | 'operacional' | 'usuario'
          periodo?: string
          dados?: Json
          gerado_por?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
