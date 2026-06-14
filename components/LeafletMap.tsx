'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Point {
  id: number
  lat: number
  lng: number
  nome: string
  excedente: number
  distancia: string
  preco: string
}

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export default function LeafletMap({ points }: { points: Point[] }) {
  return (
    <MapContainer center={[-23.5505, -46.6333]} zoom={13} className="h-full w-full" scrollWheelZoom={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{p.nome}</p>
              <p>{p.excedente} kWh/mês excedente</p>
              <p>{p.preco}</p>
              <p className="text-emerald-600 font-bold">{p.distancia}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
