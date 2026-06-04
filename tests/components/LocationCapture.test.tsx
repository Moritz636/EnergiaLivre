import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import LocationCapture from '@/components/LocationCapture'

const mockUpsert = vi.fn()
const mockFrom = vi.fn()
const mockSupabase = {
  from: (table: string) => {
    mockFrom(table)
    return { upsert: mockUpsert }
  },
}

const mockOnSaved = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mockUpsert.mockResolvedValue({ data: null, error: null })
  ;(globalThis as any).fetch = vi.fn(async () => ({
    ok: true,
    json: async () => [{ lat: '-23.5505', lon: '-46.6333', display_name: 'São Paulo, SP' }],
  }))
})

afterEach(() => {
  delete (globalThis as any).navigator
})

describe('<LocationCapture />', () => {
  it('renderiza título e botão de GPS', () => {
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)
    expect(screen.getByText('Sua localização')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /usar minha localização/i })).toBeInTheDocument()
  })

  it('renderiza campos de busca manual (Cidade e UF)', () => {
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)
    expect(screen.getByPlaceholderText('Cidade')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('UF')).toBeInTheDocument()
  })

  it('captura GPS com sucesso e mostra confirmação', async () => {
    ;(globalThis as any).navigator = {
      geolocation: {
        getCurrentPosition: (success: any) =>
          success({ coords: { latitude: -23.5, longitude: -46.6, accuracy: 10 } }),
      },
    }
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)

    fireEvent.click(screen.getByRole('button', { name: /usar minha localização/i }))

    await waitFor(() => {
      expect(screen.getByText(/localização salva/i)).toBeInTheDocument()
    })
    expect(mockOnSaved).toHaveBeenCalledWith(-23.5, -46.6)
    expect(mockFrom).toHaveBeenCalledWith('user_locations')
  })

  it('mostra erro quando GPS é negado', async () => {
    ;(globalThis as any).navigator = {
      geolocation: {
        getCurrentPosition: (_s: any, err: any) => err({ message: 'Permission denied' }),
      },
    }
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)

    fireEvent.click(screen.getByRole('button', { name: /usar minha localização/i }))

    await waitFor(() => {
      expect(screen.getByText(/Permission denied/i)).toBeInTheDocument()
    })
    expect(mockOnSaved).not.toHaveBeenCalled()
  })

  it('busca manual com cidade+UF e mostra confirmação', async () => {
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)

    const cidade = screen.getByPlaceholderText('Cidade') as HTMLInputElement
    const uf = screen.getByPlaceholderText('UF') as HTMLInputElement
    fireEvent.change(cidade, { target: { value: 'São Paulo' } })
    fireEvent.change(uf, { target: { value: 'SP' } })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => {
      expect(screen.getByText(/localização salva/i)).toBeInTheDocument()
    })
    expect(mockOnSaved).toHaveBeenCalledWith(-23.5505, -46.6333)
  })

  it('mostra erro quando cidade/UF estão vazios', async () => {
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => {
      expect(screen.getByText(/preencha cidade e estado/i)).toBeInTheDocument()
    })
  })

  it('mostra erro quando Nominatim não encontra', async () => {
    ;(globalThis as any).fetch = vi.fn(async () => ({ ok: true, json: async () => [] }))
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)

    const cidade = screen.getByPlaceholderText('Cidade') as HTMLInputElement
    const uf = screen.getByPlaceholderText('UF') as HTMLInputElement
    fireEvent.change(cidade, { target: { value: 'Cidade Inexistente' } })
    fireEvent.change(uf, { target: { value: 'XX' } })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => {
      expect(screen.getByText(/não encontramos/i)).toBeInTheDocument()
    })
  })

  it('botão "Atualizar" reseta o estado', async () => {
    ;(globalThis as any).navigator = {
      geolocation: {
        getCurrentPosition: (success: any) =>
          success({ coords: { latitude: 1, longitude: 2, accuracy: 10 } }),
      },
    }
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)
    fireEvent.click(screen.getByRole('button', { name: /usar minha localização/i }))
    await waitFor(() => screen.getByText(/localização salva/i))

    fireEvent.click(screen.getByRole('button', { name: /atualizar/i }))

    expect(screen.getByRole('button', { name: /usar minha localização/i })).toBeInTheDocument()
  })
})
