// ============================================================
// POST /api/mock/fatura-exemplo
// Retorna dados de fatura padrao (Sao Paulo, B1, 800 kWh).
// Usado como atalho na pagina /location para teste rapido.
// ============================================================

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  return NextResponse.json({
    ok: true,
    mock: true,
    fatura: {
      cliente_nome: 'Maria da Silva (exemplo)',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP',
      cep: '01310-100',
      cidade: 'Sao Paulo',
      estado: 'SP',
      distribuidora: 'Enel SP',
      subgrupo_tarifario: 'B1',
      consumo_kwh_medio: 800,
      valor_kwh_atual: 0.92,
      valor_fatura_atual: 736.0,
      lat: -23.561414,
      lng: -46.655881,
      bandeira_tarifaria: 'verde',
    },
  })
}
