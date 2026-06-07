// ============================================================
// MOCK USINAS — Usinas geradoras ficticias para a pagina
// publica /location e /match. Quando o Supabase tiver dados
// reais, este mock pode ser desativado via env MOCK_MODE=false.
// ============================================================

export interface MockUsina {
  id: string
  nome: string
  cidade: string
  estado: string
  lat: number
  lng: number
  subgrupo_tarifario: 'A1' | 'A2' | 'A3' | 'A4' | 'B1' | 'B2'
  distribuidora: string
  capacidade_kwp: number
  excedente_mensal_kwh: number
  valor_kwh_atual: number
  preco_oferta_kwh: number
  desconto_percentual: number
  ranking_score: number
  total_avaliacoes: number
  media_avaliacoes: number
  destaque: string
  stripe_price_id: string
  stripe_payment_link: string
  pacote_kwh: number
  pacote_preco: number
}

export const MOCK_USINAS: MockUsina[] = [
  {
    id: 'mock_usina_1',
    nome: 'Sol Nascente - SP',
    cidade: 'Campinas',
    estado: 'SP',
    lat: -22.9056,
    lng: -47.0608,
    subgrupo_tarifario: 'B1',
    distribuidora: 'CPFL Paulista',
    capacidade_kwp: 250,
    excedente_mensal_kwh: 18000,
    valor_kwh_atual: 0.95,
    preco_oferta_kwh: 0.68,
    desconto_percentual: 28,
    ranking_score: 4.8,
    total_avaliacoes: 142,
    media_avaliacoes: 4.7,
    destaque: 'Maior usina do interior paulista',
    stripe_price_id: 'price_match_sol_nascente_30d',
    stripe_payment_link:
      'https://buy.stripe.com/9,99?client=usina_1&utm_source=match&plan=sol_nascente',
    pacote_kwh: 500,
    pacote_preco: 339.5,
  },
  {
    id: 'mock_usina_2',
    nome: 'Ventos do Sul - RS',
    cidade: 'Pelotas',
    estado: 'RS',
    lat: -31.7719,
    lng: -52.3425,
    subgrupo_tarifario: 'B1',
    distribuidora: 'CEEE',
    capacidade_kwp: 180,
    excedente_mensal_kwh: 12000,
    valor_kwh_atual: 0.92,
    preco_oferta_kwh: 0.62,
    desconto_percentual: 32,
    ranking_score: 4.6,
    total_avaliacoes: 89,
    media_avaliacoes: 4.5,
    destaque: 'Energia eolica + solar 24/7',
    stripe_price_id: 'price_match_ventos_sul_30d',
    stripe_payment_link:
      'https://buy.stripe.com/9,99?client=usina_2&utm_source=match&plan=ventos_sul',
    pacote_kwh: 400,
    pacote_preco: 248.0,
  },
  {
    id: 'mock_usina_3',
    nome: 'Biomassa Central - MG',
    cidade: 'Uberlandia',
    estado: 'MG',
    lat: -18.9186,
    lng: -48.2766,
    subgrupo_tarifario: 'A4',
    distribuidora: 'CEMIG',
    capacidade_kwp: 320,
    excedente_mensal_kwh: 22000,
    valor_kwh_atual: 0.98,
    preco_oferta_kwh: 0.74,
    desconto_percentual: 24,
    ranking_score: 4.9,
    total_avaliacoes: 201,
    media_avaliacoes: 4.8,
    destaque: 'Biomassa + solar hibrido (premium)',
    stripe_price_id: 'price_match_biomassa_premium_30d',
    stripe_payment_link:
      'https://buy.stripe.com/14,99?client=usina_3&utm_source=match&plan=biomassa_premium',
    pacote_kwh: 800,
    pacote_preco: 591.2,
  },
]

/** Lista de distribuidores conhecidas (mock para autocomplete). */
export const MOCK_DISTRIBUIDORAS = [
  'CPFL Paulista',
  'CPFL Piratininga',
  'Enel SP',
  'Enel RJ',
  'Light (RJ)',
  'CEEE',
  'RGE',
  'CEMIG',
  'Copel',
  'Celesc',
  'Coelba',
  'Cosern',
  'Enel CE',
  'Enel GO',
  'Equatorial',
  'Amazonas Energia',
]

/** Subgrupos tarifarios validos (Baixa/Alta tensao). */
export const SUBGRUPOS = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3'] as const
export type Subgrupo = (typeof SUBGRUPOS)[number]
