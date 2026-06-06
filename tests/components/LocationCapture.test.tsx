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
  ;(globalThis as any).fetch = vi.fn(async (url: string) => {
    if (typeof url === 'string' && url.includes('nominatim.openstreetmap.org/search')) {
      return {
        ok: true,
        json: async () => [
          {
            place_id: 123,
            display_name: 'Avenida Paulista, 1000 - São Paulo, SP',
            lat: '-23.5505',
            lon: '-46.6333',
            address: {
              road: 'Avenida Paulista',
              house_number: '1000',
              suburb: 'Bela Vista',
              city: 'São Paulo',
              state: 'São Paulo',
              state_code: 'SP',
              country: 'Brasil',
              country_code: 'br',
              postcode: '01310-100',
            },
          },
        ],
      }
    }
    return { ok: true, json: async () => [] }
  })
})

afterEach(() => {
  delete (globalThis as any).navigator
})

describe('<LocationCapture />', () => {
  it('renderiza título e botão de GPS', () => {
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)
    expect(screen.getByText('Sua localização')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^gps$/i })).toBeInTheDocument()
  })

  it('renderiza campo de endereço com placeholder', () => {
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)
    expect(
      screen.getByPlaceholderText(/digite seu endereço/i),
    ).toBeInTheDocument()
  })

  it('mostra provider badge (OpenStreetMap quando sem Google)', () => {
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)
    expect(screen.getByText(/OpenStreetMap/i)).toBeInTheDocument()
  })

  it('captura GPS com sucesso e mostra confirmação', async () => {
    ;(globalThis as any).navigator = {
      geolocation: {
        getCurrentPosition: (success: any) =>
          success({ coords: { latitude: -23.5, longitude: -46.6, accuracy: 10 } }),
      },
    }
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)

    fireEvent.click(screen.getByRole('button', { name: /^gps$/i }))

    await waitFor(() => {
      expect(screen.getByText(/localização salva/i)).toBeInTheDocument()
    })
    expect(mockOnSaved).toHaveBeenCalledWith(-23.5, -46.6, undefined)
    expect(mockFrom).toHaveBeenCalledWith('user_locations')
  })

  it('mostra erro quando GPS é negado', async () => {
    ;(globalThis as any).navigator = {
      geolocation: {
        getCurrentPosition: (_s: any, err: any) => err({ message: 'Permission denied' }),
      },
    }
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)

    fireEvent.click(screen.getByRole('button', { name: /^gps$/i }))

    await waitFor(() => {
      expect(screen.getByText(/Permission denied/i)).toBeInTheDocument()
    })
    expect(mockOnSaved).not.toHaveBeenCalled()
  })

  it('selecionar sugestão do Nominatim salva e chama onSaved com place', async () => {
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)

    const input = screen.getByPlaceholderText(/digite seu endereço/i)
    fireEvent.change(input, { target: { value: 'Avenida Paulista' } })

    await waitFor(
      () => {
        expect(screen.getByText(/Avenida Paulista/)).toBeInTheDocument()
      },
      { timeout: 1500 },
    )

    const suggestion = screen.getByText(/Avenida Paulista/)
    fireEvent.click(suggestion)

    await waitFor(() => {
      expect(screen.getByText(/localização salva/i)).toBeInTheDocument()
    })

    expect(mockOnSaved).toHaveBeenCalledWith(
      -23.5505,
      -46.6333,
      expect.objectContaining({
        formattedAddress: expect.stringContaining('Avenida Paulista'),
        lat: -23.5505,
        lng: -46.6333,
      }),
    )
  })

  it('botão "Atualizar" reseta o estado', async () => {
    ;(globalThis as any).navigator = {
      geolocation: {
        getCurrentPosition: (success: any) =>
          success({ coords: { latitude: 1, longitude: 2, accuracy: 10 } }),
      },
    }
    render(<LocationCapture supabase={mockSupabase} userId="u-1" onSaved={mockOnSaved} />)
    fireEvent.click(screen.getByRole('button', { name: /^gps$/i }))
    await waitFor(() => screen.getByText(/localização salva/i))

    fireEvent.click(screen.getByRole('button', { name: /atualizar/i }))

    expect(screen.getByRole('button', { name: /^gps$/i })).toBeInTheDocument()
  })
})
