import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import SwipeCard, { type MatchCandidateData } from '@/components/Match/SwipeCard'

const baseCandidate: MatchCandidateData = {
  id: 'c-1',
  nome: 'Usina Solar São Paulo',
  cidade: 'São Paulo',
  estado: 'SP',
  capacidadeKwp: 50,
  distanciaKm: 12.5,
  tipo: 'gerador',
  economiaEstimada: 'R$ 250/mês',
}

describe('<SwipeCard />', () => {
  it('renderiza nome, cidade e distância', () => {
    render(<SwipeCard candidate={baseCandidate} onPropose={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.getByText('Usina Solar São Paulo')).toBeInTheDocument()
    expect(screen.getByText(/São Paulo, SP/)).toBeInTheDocument()
    expect(screen.getByText('12.5 km')).toBeInTheDocument()
  })

  it('renderiza capacidade e economia quando presentes', () => {
    render(<SwipeCard candidate={baseCandidate} onPropose={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.getByText('50 kWp')).toBeInTheDocument()
    expect(screen.getByText('R$ 250/mês')).toBeInTheDocument()
  })

  it('renderiza badge de tipo correto (gerador vs consumidor)', () => {
    const { rerender } = render(<SwipeCard candidate={baseCandidate} onPropose={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.getByText('gerador')).toBeInTheDocument()

    rerender(<SwipeCard candidate={{ ...baseCandidate, tipo: 'consumidor' }} onPropose={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.getByText('consumidor')).toBeInTheDocument()
  })

  it('chama onSkip ao clicar em Pular', async () => {
    const onSkip = vi.fn()
    const onPropose = vi.fn()
    render(<SwipeCard candidate={baseCandidate} onPropose={onPropose} onSkip={onSkip} />)

    fireEvent.click(screen.getByRole('button', { name: /pular/i }))

    expect(onSkip).toHaveBeenCalledWith(baseCandidate)
    expect(onPropose).not.toHaveBeenCalled()
  })

  it('chama onPropose ao clicar em Propor Match', async () => {
    const onSkip = vi.fn()
    const onPropose = vi.fn().mockResolvedValue(undefined)
    render(<SwipeCard candidate={baseCandidate} onPropose={onPropose} onSkip={onSkip} />)

    fireEvent.click(screen.getByRole('button', { name: /propor match/i }))

    await waitFor(() => {
      expect(onPropose).toHaveBeenCalledWith(baseCandidate)
    })
    expect(onSkip).not.toHaveBeenCalled()
  })

  it('desabilita botões durante loading', () => {
    render(<SwipeCard candidate={baseCandidate} onPropose={vi.fn()} onSkip={vi.fn()} loading />)
    expect(screen.getByRole('button', { name: /pular/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /propor match/i })).toBeDisabled()
  })

  it('não renderiza capacidade quando ausente', () => {
    render(
      <SwipeCard
        candidate={{ ...baseCandidate, capacidadeKwp: undefined }}
        onPropose={vi.fn()}
        onSkip={vi.fn()}
      />,
    )
    expect(screen.queryByText(/kWp/)).not.toBeInTheDocument()
  })
})
