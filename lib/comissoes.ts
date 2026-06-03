// ============================================
// SISTEMA DE COMISSÕES - CONFIGURAÇÃO
// ============================================

export interface ComissaoConfig {
  percentualCadastro: number;     // % no primeiro cadastro
  percentualRecorrente: number;   // % mensal recorrente
  percentualBonus: number;        // % bonus por meta atingida
  valorMinimoPagamento: number;   // R$ mínimo para saque
}

// Configuração padrão (Lei 38: Parece generoso, mas é estratégico)
export const COMISSAO_CONFIG: ComissaoConfig = {
  percentualCadastro: 100,    // 100% no primeiro cadastro (gancho)
  percentualRecorrente: 5,    // 5% mensal (renda passiva)
  percentualBonus: 10,        // 10% bonus por meta
  valorMinimoPagamento: 50.00 // R$ 50 mínimo para saque
};

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

export function calcularComissaoCadastro(
  valorPlano: number,
  percentual: number = COMISSAO_CONFIG.percentualCadastro
): number {
  return (valorPlano * percentual) / 100;
}

export function calcularComissaoRecorrente(
  valorAssinatura: number,
  percentual: number = COMISSAO_CONFIG.percentualRecorrente
): number {
  return (valorAssinatura * percentual) / 100;
}

export function calcularComissaoBonus(
  valorBase: number,
  metasAtingidas: number,
  percentual: number = COMISSAO_CONFIG.percentualBonus
): number {
  return (valorBase * percentual * metasAtingidas) / 100;
}

// ============================================
// SISTEMA DE METAS (Lei 32: Submeta-se à ação)
// ============================================

export interface Meta {
  cadastros: number;
  bonus: number;
  descricao: string;
}

export const METAS_EMBaixADOR: Meta[] = [
  { cadastros: 10, bonus: 100, descricao: 'Iniciante' },
  { cadastros: 25, bonus: 250, descricao: 'Bronze' },
  { cadastros: 50, bonus: 500, descricao: 'Prata' },
  { cadastros: 100, bonus: 1000, descricao: 'Ouro' },
  { cadastros: 250, bonus: 2500, descricao: 'Diamante' },
  { cadastros: 500, bonus: 5000, descricao: 'Elite' },
];

export function calcularNivelEmbaixador(cadastros: number): Meta {
  return METAS_EMBaixADOR.reduce((meta, atual) => {
    return cadastros >= atual.cadastros ? atual : meta;
  }, METAS_EMBaixADOR[0]);
}

// ============================================
// PROJEÇÃO DE RENDA (Lei 6: Chame atenção)
// ============================================

export interface ProjecaoRenda {
  mes: number;
  cadastros: number;
  rendaCadastro: number;
  rendaRecorrente: number;
  rendaBonus: number;
  rendaTotal: number;
}

export function calcularProjecaoRenda(
  cadastrosPorMes: number,
  ticketMedio: number = 149.90, // Plano Familiar
  meses: number = 12
): ProjecaoRenda[] {
  const projecao: ProjecaoRenda[] = [];
  let totalClientes = 0;

  for (let mes = 1; mes <= meses; mes++) {
    const novosCadastros = cadastrosPorMes;
    totalClientes += novosCadastros;

    const rendaCadastro = calcularComissaoCadastro(ticketMedio) * novosCadastros;
    const rendaRecorrente = calcularComissaoRecorrente(ticketMedio) * totalClientes;
    const meta = calcularNivelEmbaixador(totalClientes);
    const rendaBonus = totalClientes % meta.cadastros === 0 ? meta.bonus : 0;

    projecao.push({
      mes,
      cadastros: totalClientes,
      rendaCadastro,
      rendaRecorrente,
      rendaBonus,
      rendaTotal: rendaCadastro + rendaRecorrente + rendaBonus,
    });
  }

  return projecao;
}

// ============================================
// EXPORTS PRINCIPAIS
// ============================================

export const comissoes = {
  calcularComissaoCadastro,
  calcularComissaoRecorrente,
  calcularComissaoBonus,
  calcularNivelEmbaixador,
  calcularProjecaoRenda,
  COMISSAO_CONFIG,
  METAS_EMBaixADOR,
};

// Funções nomeadas para import direto (compatibilidade com a API route)
export const calcular_comissao_cadastro = calcularComissaoCadastro;
export const calcular_comissao_recorrente = calcularComissaoRecorrente;