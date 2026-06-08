'use client';
import { useEffect, useRef } from 'react';

export type MapMarker = {
  id: string
  lat: number
  lng: number
  label: string
  color?: 'emerald' | 'yellow' | 'blue' | 'purple' | 'red'
  popupHtml?: string
  pulse?: boolean
}

export type MapCircle = {
  center: [number, number]
  radiusMeters: number
  color?: string
  fillColor?: string
  fillOpacity?: number
}

type Props = {
  center: [number, number]
  zoom?: number
  markers: MapMarker[]
  height?: string
  className?: string
  onMarkerClick?: (id: string) => void
  circle?: MapCircle | null
  showAttribution?: boolean
}

const COLOR_MAP: Record<string, string> = {
  emerald: '#10b981',
  yellow: '#eab308',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  red: '#ef4444',
}

export default function MatchMap({
  center, zoom = 11, markers, height = '420px',
  className = '', onMarkerClick, circle, showAttribution = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const circleRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let disposed = false
    const containerEl = containerRef.current

    ;(async () => {
      const L = (await import('leaflet')).default
      try {
        // @ts-expect-error - CSS sem tipos TS
        await import('leaflet/dist/leaflet.css')
      } catch { /* ignore */ }

      if (disposed || !containerEl) return

      if (!containerEl.dataset.initialized) {
        const map = L.map(containerEl, {
          center,
          zoom,
          zoomControl: true,
          attributionControl: showAttribution,
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

      // Update circle
      if (circleRef.current) {
        map.removeLayer(circleRef.current)
        circleRef.current = null
      }
      if (circle) {
        circleRef.current = L.circle(circle.center, {
          radius: circle.radiusMeters,
          color: circle.color || '#10b981',
          fillColor: circle.fillColor || '#10b981',
          fillOpacity: circle.fillOpacity ?? 0.08,
          weight: 2,
          opacity: 0.4,
          dashArray: '8 6',
        }).addTo(map)
        const bounds = circleRef.current.getBounds()
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] })
      }

      // Update markers
      layer.clearLayers()
      for (const m of markers) {
        const icon = L.divIcon({
          className: 'match-marker',
          html: m.pulse
            ? `<div style="position:relative;width:16px;height:16px;"><div style="position:absolute;inset:-4px;border-radius:9999px;background:${COLOR_MAP[m.color || 'emerald']}44;animation:marker-pulse 2s infinite;"></div><div style="width:16px;height:16px;border-radius:9999px;background:${COLOR_MAP[m.color || 'emerald']};border:3px solid #020617;box-shadow:0 0 0 2px ${COLOR_MAP[m.color || 'emerald']}55;"></div></div>`
            : `<div style="width:16px;height:16px;border-radius:9999px;background:${COLOR_MAP[m.color || 'emerald']};border:3px solid #020617;box-shadow:0 0 0 2px ${COLOR_MAP[m.color || 'emerald']}55;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(layer)
        const popupHtml = m.popupHtml || `<strong>${m.label}</strong>`
        marker.bindPopup(popupHtml)
        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(m.id))
        }
      }
    })()

    return () => { disposed = true }
  }, [center, zoom, markers, onMarkerClick, circle, showAttribution])

  useEffect(() => {
    const containerEl = containerRef.current
    return () => {
      try {
        mapRef.current?.remove()
        mapRef.current = null
        layerRef.current = null
        circleRef.current = null
        if (containerEl) delete containerEl.dataset.initialized
      } catch {}
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
