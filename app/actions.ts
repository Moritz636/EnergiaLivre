"use server";

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function saveLead(formData: any) {
  try {
    // O objeto abaixo agora mapeia TODOS os possíveis campos de ambas as páginas
    const { error } = await supabaseAdmin
      .from('leads')
      .insert([
        { 
          nome: formData.nome, 
          email: formData.email, 
          whatsapp: formData.whatsapp,
          // Dados de quem quer ECONOMIZAR
          gasto_mensal: formData.gastoMensal || null, 
          cidade: formData.cidade || null,
          // Dados de quem quer VENDER
          capacidade: formData.capacidade || null, 
          estado: formData.estado || null,
        },
      ]);

    if (error) {
      console.error("Erro do Supabase Admin:", error);
      return { success: false, message: error.message };
    }

    console.log(`🚨 NOVO LEAD! Notificar: energialivreofc@gmail.com`);
    return { success: true };
  } catch (error: any) {
    console.error("Erro crítico na Server Action:", error);
    return { success: false, message: error.message };
  }
}
