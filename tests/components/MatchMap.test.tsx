import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import MatchMap, { type MapMarker } from '@/components/Map/MatchMap'

// Mock do Leaflet para evitar dependência de DOM real (canvas/tiles)
vi.mock('leaflet', () => {
  const remove = vi.fn()
  const tileLayer = { addTo: vi.fn(() => ({ addTo: vi.fn() })) }
  const layerGroup = {
    addTo: vi.fn(function (this: any) { return this }),
    clearLayers: vi.fn(),
  }
  const markerInstance = {
    addTo: vi.fn(function (this: any) { return this }),
    bindPopup: vi.fn(function (this: any) { return this }),
    on: vi.fn(function (this: any) { return this }),
  }
  const divIcon = vi.fn(() => ({}))
  const L = vi.fn(() => ({
    map: vi.fn(() => ({
      setView: vi.fn(),
      remove,
      addLayer: vi.fn(),
    })),
    tileLayer: vi.fn(() => tileLayer),
    layerGroup: vi.fn(() => layerGroup),
    marker: vi.fn(() => markerInstance),
    divIcon,
  }))
  ;(L as any).default = L
  return { default: L }
})

const mockMarkers: MapMarker[] = [
  { id: 'm1', lat: -23.55, lng: -46.63, label: 'A', color: 'emerald' },
  { id: 'm2', lat: -23.5, lng: -46.6, label: 'B', color: 'blue' },
]

describe('<MatchMap />', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renderiza um container div', () => {
    const { container } = render(
      <MatchMap center={[-23.55, -46.63]} markers={mockMarkers} height="300px" />,
    )
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement)
  })

  it('aplica altura customizada via prop height', () => {
    const { container } = render(
      <MatchMap center={[0, 0]} markers={[]} height="200px" />,
    )
    const div = container.firstChild as HTMLElement
    expect(div.style.height).toBe('200px')
  })

  it('aceita array de markers sem quebrar', () => {
    expect(() =>
      render(<MatchMap center={[0, 0]} markers={mockMarkers} height="300px" />),
    ).not.toThrow()
  })

  it('aceita markers vazios sem quebrar', () => {
    expect(() =>
      render(<MatchMap center={[0, 0]} markers={[]} height="300px" />),
    ).not.toThrow()
  })

  it('cleanup não lança erro ao desmontar', () => {
    const { unmount } = render(
      <MatchMap center={[0, 0]} markers={mockMarkers} height="300px" />,
    )
    expect(() => unmount()).not.toThrow()
  })
})
