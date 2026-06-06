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
          tipo: 'consumidor' | 'gerador' | 'parceiro' | 'admin'
          role: 'user' | 'admin'
          whatsapp: string
          cidade: string
          estado: string
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
          member_plus_active: boolean
          member_plus_activated_at: string | null
          member_plus_expires_at: string | null
        }
        Insert: {
          id: string
          email: string
          nome: string
          tipo: 'consumidor' | 'gerador' | 'parceiro' | 'admin'
          role?: 'user' | 'admin'
          whatsapp?: string
          cidade?: string
          estado?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
          member_plus_active?: boolean
          member_plus_activated_at?: string | null
          member_plus_expires_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          nome?: string
          tipo?: 'consumidor' | 'gerador' | 'parceiro' | 'admin'
          role?: 'user' | 'admin'
          whatsapp?: string
          cidade?: string
          estado?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
          member_plus_active?: boolean
          member_plus_activated_at?: string | null
          member_plus_expires_at?: string | null
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
          tipo: 'consumidor' | 'gerador' | 'parceiro'
          capacidade_kwp: number | null
          gasto_mensal: number | null
          concessionaria: string | null
          nicho: string | null
          audiencia_estimada: number | null
          canal: string | null
          status: 'pendente' | 'aprovado' | 'recusado'
          created_at: string
          updated_at: string
          processed_at: string | null
          processed_by: string | null
          observacoes: string | null
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          nome: string
          email: string
          whatsapp: string
          cidade: string
          estado: string
          tipo: 'consumidor' | 'gerador' | 'parceiro'
          capacidade_kwp?: number | null
          gasto_mensal?: number | null
          concessionaria?: string | null
          nicho?: string | null
          audiencia_estimada?: number | null
          canal?: string | null
          status?: 'pendente' | 'aprovado' | 'recusado'
          created_at?: string
          updated_at?: string
          processed_at?: string | null
          processed_by?: string | null
          observacoes?: string | null
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: number
          user_id?: string | null
          nome?: string
          email?: string
          whatsapp?: string
          cidade?: string
          estado?: string
          tipo?: 'consumidor' | 'gerador' | 'parceiro'
          capacidade_kwp?: number | null
          gasto_mensal?: number | null
          concessionaria?: string | null
          nicho?: string | null
          audiencia_estimada?: number | null
          canal?: string | null
          status?: 'pendente' | 'aprovado' | 'recusado'
          created_at?: string
          updated_at?: string
          processed_at?: string | null
          processed_by?: string | null
          observacoes?: string | null
          latitude?: number | null
          longitude?: number | null
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
          preco_kwh: number | null
          desconto_percentual: number | null
          pacote_kwh: number | null
          pacote_preco: number | null
          ranking_score: number | null
          total_avaliacoes: number | null
          media_avaliacoes: number | null
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
          preco_kwh?: number | null
          desconto_percentual?: number | null
          pacote_kwh?: number | null
          pacote_preco?: number | null
          ranking_score?: number | null
          total_avaliacoes?: number | null
          media_avaliacoes?: number | null
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
          preco_kwh?: number | null
          desconto_percentual?: number | null
          pacote_kwh?: number | null
          pacote_preco?: number | null
          ranking_score?: number | null
          total_avaliacoes?: number | null
          media_avaliacoes?: number | null
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
          tipo_plano: 'consumidor' | 'gerador' | 'member_plus'
          capacidade_kwp: number | null
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
          tipo_plano?: 'consumidor' | 'gerador' | 'member_plus'
          capacidade_kwp?: number | null
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
          tipo_plano?: 'consumidor' | 'gerador' | 'member_plus'
          capacidade_kwp?: number | null
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
      admins: {
        Row: {
          id: string
          email: string
          nome: string | null
          role: 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nome?: string | null
          role?: 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string | null
          role?: 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      user_locations: {
        Row: {
          user_id: string
          lat: number
          lng: number
          cidade: string
          estado: string
          endereco: string | null
          cep: string | null
          accuracy_meters: number | null
          source: 'browser' | 'geocoded' | 'manual'
          updated_at: string
          created_at: string
        }
        Insert: {
          user_id: string
          lat: number
          lng: number
          cidade: string
          estado: string
          endereco?: string | null
          cep?: string | null
          accuracy_meters?: number | null
          source?: 'browser' | 'geocoded' | 'manual'
          updated_at?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          lat?: number
          lng?: number
          cidade?: string
          estado?: string
          endereco?: string | null
          cep?: string | null
          accuracy_meters?: number | null
          source?: 'browser' | 'geocoded' | 'manual'
          updated_at?: string
          created_at?: string
        }
      }
      match_proposals: {
        Row: {
          id: number
          from_user_id: string
          to_user_id: string
          gerador_id: string | null
          consumidor_id: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
          message: string | null
          expires_at: string
          responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          from_user_id: string
          to_user_id: string
          gerador_id?: string | null
          consumidor_id?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
          message?: string | null
          expires_at?: string
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          from_user_id?: string
          to_user_id?: string
          gerador_id?: string | null
          consumidor_id?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
          message?: string | null
          expires_at?: string
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_uploads: {
        Row: {
          id: string
          user_id: string
          uploaded_by_role: 'consumidor' | 'embaixador'
          cliente_nome: string | null
          cliente_whatsapp: string | null
          file_url: string
          file_name: string
          file_type: string | null
          file_size: number | null
          status: 'pending' | 'analyzing' | 'analyzed' | 'matching' | 'matched' | 'failed'
          estado: string | null
          concessionaria: string | null
          valor_total: number | null
          kwh_mensal: number | null
          vencimento: string | null
          raw_extraction: Json | null
          error_message: string | null
          match_count: number
          latitude: number | null
          longitude: number | null
          endereco: string | null
          barcode_payload: string | null
          barcode_type: 'linha_digitavel' | 'qrcode' | 'itf' | 'code128' | 'other' | null
          match_eligible: boolean
          match_eligible_at: string | null
          source: 'upload' | 'scan' | 'manual'
          created_at: string
          updated_at: string
          analyzed_at: string | null
          matched_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          uploaded_by_role: 'consumidor' | 'embaixador'
          cliente_nome?: string | null
          cliente_whatsapp?: string | null
          file_url: string
          file_name: string
          file_type?: string | null
          file_size?: number | null
          status?: 'pending' | 'analyzing' | 'analyzed' | 'matching' | 'matched' | 'failed'
          estado?: string | null
          concessionaria?: string | null
          valor_total?: number | null
          kwh_mensal?: number | null
          vencimento?: string | null
          raw_extraction?: Json | null
          error_message?: string | null
          match_count?: number
          latitude?: number | null
          longitude?: number | null
          endereco?: string | null
          barcode_payload?: string | null
          barcode_type?: 'linha_digitavel' | 'qrcode' | 'itf' | 'code128' | 'other' | null
          match_eligible?: boolean
          match_eligible_at?: string | null
          source?: 'upload' | 'scan' | 'manual'
          created_at?: string
          updated_at?: string
          analyzed_at?: string | null
          matched_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          uploaded_by_role?: 'consumidor' | 'embaixador'
          cliente_nome?: string | null
          cliente_whatsapp?: string | null
          file_url?: string
          file_name?: string
          file_type?: string | null
          file_size?: number | null
          status?: 'pending' | 'analyzing' | 'analyzed' | 'matching' | 'matched' | 'failed'
          estado?: string | null
          concessionaria?: string | null
          valor_total?: number | null
          kwh_mensal?: number | null
          vencimento?: string | null
          raw_extraction?: Json | null
          error_message?: string | null
          match_count?: number
          latitude?: number | null
          longitude?: number | null
          endereco?: string | null
          barcode_payload?: string | null
          barcode_type?: 'linha_digitavel' | 'qrcode' | 'itf' | 'code128' | 'other' | null
          match_eligible?: boolean
          match_eligible_at?: string | null
          source?: 'upload' | 'scan' | 'manual'
          created_at?: string
          updated_at?: string
          analyzed_at?: string | null
          matched_at?: string | null
        }
      }
      token_pre_registrations: {
        Row: {
          id: string
          email: string
          wallet_address: string | null
          package_code: string | null
          package_tokens: number | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          referred_by_code: string | null
          status: 'pending' | 'confirmed' | 'rejected' | 'launched'
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          wallet_address?: string | null
          package_code?: string | null
          package_tokens?: number | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          referred_by_code?: string | null
          status?: 'pending' | 'confirmed' | 'rejected' | 'launched'
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          wallet_address?: string | null
          package_code?: string | null
          package_tokens?: number | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          referred_by_code?: string | null
          status?: 'pending' | 'confirmed' | 'rejected' | 'launched'
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pix_payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string | null
          purpose: 'coin_purchase' | 'plan_subscription' | 'token_presale' | 'invoice_payment' | 'celular_recharge' | 'other'
          status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded' | 'failed'
          txid: string | null
          qr_code: string | null
          qr_code_image: string | null
          pix_copy_paste: string | null
          expires_at: string
          paid_at: string | null
          provider: string | null
          provider_payload: Json | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description?: string | null
          purpose: 'coin_purchase' | 'plan_subscription' | 'token_presale' | 'invoice_payment' | 'celular_recharge' | 'other'
          status?: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded' | 'failed'
          txid?: string | null
          qr_code?: string | null
          qr_code_image?: string | null
          pix_copy_paste?: string | null
          expires_at: string
          paid_at?: string | null
          provider?: string | null
          provider_payload?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string | null
          purpose?: 'coin_purchase' | 'plan_subscription' | 'token_presale' | 'invoice_payment' | 'celular_recharge' | 'other'
          status?: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded' | 'failed'
          txid?: string | null
          qr_code?: string | null
          qr_code_image?: string | null
          pix_copy_paste?: string | null
          expires_at?: string
          paid_at?: string | null
          provider?: string | null
          provider_payload?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      celular_recargas: {
        Row: {
          id: string
          user_id: string
          numero: string
          operadora: string | null
          valor: number
          pix_payment_id: string | null
          status: 'pending' | 'paid' | 'processing' | 'completed' | 'failed' | 'refunded'
          provider: string | null
          provider_payload: Json | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          numero: string
          operadora?: string | null
          valor: number
          pix_payment_id?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'completed' | 'failed' | 'refunded'
          provider?: string | null
          provider_payload?: Json | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          numero?: string
          operadora?: string | null
          valor?: number
          pix_payment_id?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'completed' | 'failed' | 'refunded'
          provider?: string | null
          provider_payload?: Json | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
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
