import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MemberPlusBlocker from '@/components/Match/MemberPlusBlocker'

describe('<MemberPlusBlocker />', () => {
  it('renderiza título padrão (não expirado)', () => {
    render(<MemberPlusBlocker />)
    expect(screen.getByText(/match é exclusivo para member plus/i)).toBeInTheDocument()
  })

  it('renderiza título de renovação quando expired=true', () => {
    render(<MemberPlusBlocker expired />)
    expect(screen.getByText(/renove seu member plus/i)).toBeInTheDocument()
  })

  it('mostra dias restantes quando daysRemaining > 0', () => {
    render(<MemberPlusBlocker daysRemaining={15} />)
    expect(screen.getByText(/15 dias/)).toBeInTheDocument()
  })

  it('não mostra dias restantes quando 0', () => {
    render(<MemberPlusBlocker daysRemaining={0} />)
    expect(screen.queryByText(/0 dias/)).not.toBeInTheDocument()
  })

  it('renderiza os 3 benefícios', () => {
    render(<MemberPlusBlocker />)
    expect(screen.getByText(/mapa interativo com geradores próximos/i)).toBeInTheDocument()
    expect(screen.getByText(/match com 1 clique/i)).toBeInTheDocument()
    expect(screen.getByText(/chat integrado para negociar/i)).toBeInTheDocument()
  })

  it('CTA padrão aponta para /checkout-member-plus', () => {
    render(<MemberPlusBlocker />)
    const link = screen.getByRole('link', { name: /ativar member plus/i })
    expect(link).toHaveAttribute('href', '/checkout-member-plus')
  })

  it('CTA de renovação aponta para /checkout-member-plus', () => {
    render(<MemberPlusBlocker expired />)
    const link = screen.getByRole('link', { name: /renovar member plus/i })
    expect(link).toHaveAttribute('href', '/checkout-member-plus')
  })
})
