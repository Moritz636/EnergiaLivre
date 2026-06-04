'use client';
import { useEffect, useRef } from 'react';

export type MapMarker = {
  id: string
  lat: number
  lng: number
  label: string
  color?: 'emerald' | 'yellow' | 'blue'
  popupHtml?: string
}

type Props = {
  center: [number, number]
  zoom?: number
  markers: MapMarker[]
  height?: string
  className?: string
  onMarkerClick?: (id: string) => void
}

const COLOR_MAP: Record<NonNullable<MapMarker['color']>, string> = {
  emerald: '#10b981',
  yellow: '#eab308',
  blue: '#3b82f6',
}

export default function MatchMap({ center, zoom = 11, markers, height = '420px', className = '', onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let disposed = false
    const containerEl = containerRef.current

    ;(async () => {
      const L = (await import('leaflet')).default
      // CSS do Leaflet é importado em 'app/globals.css' via @import
      // Mantemos o import dinâmico para garantir inclusão no bundle do client
      try {
        // @ts-expect-error - CSS sem tipos TS
        await import('leaflet/dist/leaflet.css')
      } catch {
        // ignore se não estiver no TS scope
      }

      if (disposed || !containerEl) return

      if (!containerEl.dataset.initialized) {
        const map = L.map(containerEl, {
          center,
          zoom,
          zoomControl: true,
          attributionControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        mapRef.current = map
        layerRef.current = L.layerGroup().addTo(map)
        containerEl.dataset.initialized = '1'
      }

      const map = mapRef.current
      const layer = layerRef.current
      if (!map || !layer) return

      map.setView(center, zoom)
      layer.clearLayers()

      for (const m of markers) {
        const icon = L.divIcon({
          className: 'match-marker',
          html: `<div style="width:14px;height:14px;border-radius:9999px;background:${COLOR_MAP[m.color || 'emerald']};border:3px solid #020617;box-shadow:0 0 0 2px ${COLOR_MAP[m.color || 'emerald']}55;"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(layer)
        const popupHtml = m.popupHtml || `<strong>${m.label}</strong>`
        marker.bindPopup(popupHtml)
        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(m.id))
        }
      }
    })()

    return () => {
      disposed = true
    }
  }, [center, zoom, markers, onMarkerClick])

  useEffect(() => {
    const containerEl = containerRef.current
    return () => {
      try {
        mapRef.current?.remove()
        mapRef.current = null
        layerRef.current = null
        if (containerEl) {
          delete containerEl.dataset.initialized
        }
      } catch {
        // ignore
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className={`rounded-2xl overflow-hidden border border-white/10 ${className}`}
    />
  )
}
