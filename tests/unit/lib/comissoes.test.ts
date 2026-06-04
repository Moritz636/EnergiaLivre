import { describe, it, expect } from 'vitest'
import {
  calcularComissaoCadastro,
  calcularComissaoRecorrente,
  calcularComissaoBonus,
  calcularNivelEmbaixador,
  calcularProjecaoRenda,
  COMISSAO_CONFIG,
  METAS_EMBaixADOR,
  comissoes,
} from '@/lib/comissoes'

describe('lib/comissoes', () => {
  describe('calcularComissaoCadastro', () => {
    it('calcula 100% do valor do plano por padrão', () => {
      expect(calcularComissaoCadastro(149.9)).toBe(149.9)
    })

    it('aceita percentual customizado', () => {
      expect(calcularComissaoCadastro(200, 50)).toBe(100)
    })

    it('retorna 0 para valor 0', () => {
      expect(calcularComissaoCadastro(0)).toBe(0)
    })

    it('lida com valores decimais sem perder precisão', () => {
      expect(calcularComissaoCadastro(89.9, 100)).toBeCloseTo(89.9, 2)
    })

    it('retorna 0 quando percentual é 0', () => {
      expect(calcularComissaoCadastro(100, 0)).toBe(0)
    })
  })

  describe('calcularComissaoRecorrente', () => {
    it('calcula 5% por padrão', () => {
      expect(calcularComissaoRecorrente(200)).toBe(10)
    })

    it('aceita percentual customizado', () => {
      expect(calcularComissaoRecorrente(1000, 10)).toBe(100)
    })

    it('retorna 0 para valor 0', () => {
      expect(calcularComissaoRecorrente(0)).toBe(0)
    })
  })

  describe('calcularComissaoBonus', () => {
    it('multiplica valor base, percentual e metas', () => {
      // (1000 * 10 * 2) / 100 = 200
      expect(calcularComissaoBonus(1000, 2)).toBe(200)
    })

    it('retorna 0 quando não há metas atingidas', () => {
      expect(calcularComissaoBonus(1000, 0)).toBe(0)
    })

    it('aceita percentual customizado', () => {
      // (500 * 20 * 1) / 100 = 100
      expect(calcularComissaoBonus(500, 1, 20)).toBe(100)
    })
  })

  describe('calcularNivelEmbaixador', () => {
    it('retorna nível Iniciante (0 cadastros)', () => {
      expect(calcularNivelEmbaixador(0).descricao).toBe('Iniciante')
    })

    it('retorna Iniciante de 0 a 24 cadastros', () => {
      expect(calcularNivelEmbaixador(0).descricao).toBe('Iniciante')
      expect(calcularNivelEmbaixador(9).descricao).toBe('Iniciante')
      expect(calcularNivelEmbaixador(24).descricao).toBe('Iniciante')
    })

    it('retorna Iniciante a partir de 10 cadastros (threshold = 10)', () => {
      expect(calcularNivelEmbaixador(10).descricao).toBe('Iniciante')
    })

    it('retorna Bronze a partir de 25 cadastros', () => {
      expect(calcularNivelEmbaixador(25).descricao).toBe('Bronze')
      expect(calcularNivelEmbaixador(49).descricao).toBe('Bronze')
    })

    it('retorna Prata a partir de 50 cadastros', () => {
      expect(calcularNivelEmbaixador(50).descricao).toBe('Prata')
      expect(calcularNivelEmbaixador(99).descricao).toBe('Prata')
    })

    it('retorna Ouro a partir de 100 cadastros', () => {
      expect(calcularNivelEmbaixador(150).descricao).toBe('Ouro')
    })

    it('retorna Diamante a partir de 250 cadastros', () => {
      expect(calcularNivelEmbaixador(250).descricao).toBe('Diamante')
    })

    it('retorna Elite a partir de 500 cadastros', () => {
      expect(calcularNivelEmbaixador(9999).descricao).toBe('Elite')
    })

    it('retorna metadados completos do nível', () => {
      const nivel = calcularNivelEmbaixador(50)
      expect(nivel).toEqual({
        cadastros: 50,
        bonus: 500,
        descricao: 'Prata',
      })
    })
  })

  describe('calcularProjecaoRenda', () => {
    it('projeta N meses', () => {
      const proj = calcularProjecaoRenda(5, 100, 6)
      expect(proj).toHaveLength(6)
    })

    it('soma clientes ao longo dos meses', () => {
      const proj = calcularProjecaoRenda(5, 100, 3)
      expect(proj[0].cadastros).toBe(5)
      expect(proj[1].cadastros).toBe(10)
      expect(proj[2].cadastros).toBe(15)
    })

    it('calcula renda de cadastro como 100% × valor × novosCadastros', () => {
      const proj = calcularProjecaoRenda(10, 100, 1)
      expect(proj[0].rendaCadastro).toBe(1000)
    })

    it('calcula renda recorrente como 5% × valor × totalClientes', () => {
      const proj = calcularProjecaoRenda(10, 100, 2)
      // mês 1: 10 clientes, recorrente = 5 * 10 = 50
      // mês 2: 20 clientes, recorrente = 5 * 20 = 100
      expect(proj[0].rendaRecorrente).toBe(50)
      expect(proj[1].rendaRecorrente).toBe(100)
    })

    it('soma renda total corretamente', () => {
      const proj = calcularProjecaoRenda(10, 100, 1)
      const r = proj[0]
      expect(r.rendaTotal).toBe(r.rendaCadastro + r.rendaRecorrente + r.rendaBonus)
    })

    it('usa ticket padrão (149.90) quando não informado', () => {
      const proj = calcularProjecaoRenda(1, undefined, 1)
      expect(proj[0].rendaCadastro).toBe(149.9)
    })

    it('usa 12 meses como padrão', () => {
      const proj = calcularProjecaoRenda(1)
      expect(proj).toHaveLength(12)
    })
  })

  describe('constantes', () => {
    it('COMISSAO_CONFIG tem valores esperados', () => {
      expect(COMISSAO_CONFIG).toEqual({
        percentualCadastro: 100,
        percentualRecorrente: 5,
        percentualBonus: 10,
        valorMinimoPagamento: 50,
      })
    })

    it('METAS_EMBaixADOR está em ordem crescente', () => {
      for (let i = 1; i < METAS_EMBaixADOR.length; i++) {
        expect(METAS_EMBaixADOR[i].cadastros).toBeGreaterThan(METAS_EMBaixADOR[i - 1].cadastros)
      }
    })
  })

  describe('namespace comissoes', () => {
    it('exporta todas as funções', () => {
      expect(comissoes.calcularComissaoCadastro).toBe(calcularComissaoCadastro)
      expect(comissoes.calcularComissaoRecorrente).toBe(calcularComissaoRecorrente)
      expect(comissoes.calcularComissaoBonus).toBe(calcularComissaoBonus)
      expect(comissoes.calcularNivelEmbaixador).toBe(calcularNivelEmbaixador)
      expect(comissoes.calcularProjecaoRenda).toBe(calcularProjecaoRenda)
      expect(comissoes.COMISSAO_CONFIG).toBe(COMISSAO_CONFIG)
      expect(comissoes.METAS_EMBaixADOR).toBe(METAS_EMBaixADOR)
    })
  })
})
