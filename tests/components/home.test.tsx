import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import HomePage from '@/app/page'

describe('<HomePage />', () => {
  it('renderiza a marca EnergiaLivre', () => {
    const { container } = render(<HomePage />)
    // Texto "ENERGIALIVRE" está quebrado em dois spans ("ENERGIA" + "LIVRE")
    expect(container.textContent).toMatch(/energia.*livre/i)
  })

  it('exibe o headline principal', () => {
    render(<HomePage />)
    expect(
      screen.getByRole('heading', { level: 1 })
    ).toHaveTextContent(/energia solar/i)
  })

  it('possui CTA para cadastro e geradores', () => {
    render(<HomePage />)
    const cadastroCta = screen.getByRole('link', { name: /começar agora/i })
    const geradorCta = screen.getByRole('link', { name: /sou gerador/i })
    expect(cadastroCta).toHaveAttribute('href', '/cadastro')
    expect(geradorCta).toHaveAttribute('href', '/para-geradores')
  })

  it('possui link de login no nav', () => {
    render(<HomePage />)
    const loginLink = screen.getAllByRole('link').find(l => l.getAttribute('href') === '/login')
    expect(loginLink).toBeTruthy()
  })
})
