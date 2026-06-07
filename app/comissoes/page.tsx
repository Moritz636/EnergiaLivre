'use client'

// ============================================================
// /comissoes — Painel admin/embaixador de comissões.
// Orquestra KPIs, meta, filtros e tabela.
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { Nav } from './_components/Nav'
import { StatsGrid, type Stats } from './_components/StatsGrid'
import { GoalProgress } from './_components/GoalProgress'
import { FilterBar } from './_components/FilterBar'
import {
  CommissionsTable,
  type ComissaoItem,
} from './_components/CommissionsTable'
import { LoadingState } from './_components/LoadingState'
import { AccessDenied } from './_components/AccessDenied'

interface Estatisticas {
  totalPendente: number
  totalPago: number
  totalCancelado: number
  cadastrosMes: number
  recorrentesMes: number
}

interface Meta {
  cadastros: number
  bonus: number
  descricao: string
}

const METAS: Meta[] = [
  { cadastros: 10, bonus: 100, descricao: 'Iniciante' },
  { cadastros: 25, bonus: 250, descricao: 'Bronze' },
  { cadastros: 50, bonus: 500, descricao: 'Prata' },
  { cadastros: 100, bonus: 1000, descricao: 'Ouro' },
  { cadastros: 250, bonus: 2500, descricao: 'Diamante' },
  { cadastros: 500, bonus: 5000, descricao: 'Elite' },
]

export default function ComissoesDashboardPage() {
  const { user, profile, loading } = useAuth()
  const [comissoes, setComissoes] = useState<ComissaoItem[]>([])
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalPendente: 0,
    totalPago: 0,
    totalCancelado: 0,
    cadastrosMes: 0,
    recorrentesMes: 0,
  })
  const [loadingComissoes, setLoadingComissoes] = useState(true)
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1)
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())

  useEffect(() => {
    if (user) carregarComissoes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mesSelecionado, anoSelecionado])

  const carregarComissoes = async () => {
    setLoadingComissoes(true)
    try {
      const response = await fetch(`/api/comissoes?userId=${user?.id}&status=all`)
      const data = await response.json()
      if (data.success) {
        setComissoes(data.comissoes)
        setEstatisticas(data.totais)
      }
    } catch (error) {
      console.error('Error loading commissions:', error)
    } finally {
      setLoadingComissoes(false)
    }
  }

  const cadastrosTotais = estatisticas.cadastrosMes + estatisticas.recorrentesMes
  const metaAtual = useMemo<Meta>(() => {
    return METAS.reduce((meta, atual) => (cadastrosTotais >= atual.cadastros ? atual : meta), METAS[0])
  }, [cadastrosTotais])

  const stats: Stats = {
    totalPago: estatisticas.totalPago,
    totalPendente: estatisticas.totalPendente,
    cadastrosMes: estatisticas.cadastrosMes,
    recorrentesMes: estatisticas.recorrentesMes,
    metaDescricao: metaAtual.descricao,
    metaBonus: metaAtual.bonus,
    metaCadastros: metaAtual.cadastros,
    cadastrosTotais,
  }

  if (loading) return <LoadingState />
  if (!profile || profile.role !== 'admin') return <AccessDenied />

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <Nav userName={profile.nome} />

      <div className="pt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Painel de Comissões</h1>
            <p className="text-slate-400">
              Monetize sua rede e ganhe dinheiro com cada cliente indicado
            </p>
          </div>

          <StatsGrid stats={stats} />

          <GoalProgress atuais={cadastrosTotais} meta={metaAtual.cadastros} />

          <FilterBar
            mes={mesSelecionado}
            ano={anoSelecionado}
            onMesChange={setMesSelecionado}
            onAnoChange={setAnoSelecionado}
            loading={loadingComissoes}
            onRefresh={carregarComissoes}
          />

          <CommissionsTable items={comissoes} loading={loadingComissoes} />
        </div>
      </div>
    </div>
  )
}
