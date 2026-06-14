'use client'
import { useEffect, useState } from 'react'
import { MapPin, ArrowRight, Loader2, Heart } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { MapMarker } from './MatchMap'

const MiniMap = dynamic(
  () => import('./MatchMap').then((m) => m.default),
  { ssr: false, loading: () => <div className="w-full h-52 rounded-xl bg-slate-800/60 animate-pulse" /> },
)

interface NearbyUser {
  id: string
  lat: number
  lng: number
  nome: string
  distance_km?: number
}

interface Props {
  supabase: any
  userId: string
  tipo: 'consumidor' | 'gerador'
}

export function SimpleMatchSection({ supabase, userId, tipo }: Props) {
  const [loading, setLoading] = useState(true)
  const [nearby, setNearby] = useState<NearbyUser[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; cidade?: string } | null>(null)
  const [matchCount, setMatchCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data: myLoc } = await (supabase as any)
          .from('user_locations')
          .select('lat, lng, cidade')
          .eq('user_id', userId)
          .maybeSingle()

        if (cancelled) return

        if (!myLoc?.lat || !myLoc?.lng) {
          setLoading(false)
          return
        }

        setUserLocation(myLoc)

        const targetTipo = tipo === 'consumidor' ? 'gerador' : 'consumidor'

        const { data: profiles } = await (supabase as any)
          .from('profiles')
          .select('id, nome, cidade, estado')
          .eq('tipo', targetTipo)
          .limit(100)

        if (cancelled || !profiles) { setLoading(false); return }

        const userIds = profiles.map((p: any) => p.id)
        if (userIds.length === 0) { setLoading(false); return }

        const { data: locations } = await (supabase as any)
          .from('user_locations')
          .select('user_id, lat, lng')
          .in('user_id', userIds)

        if (cancelled) { setLoading(false); return }

        const locMap = new Map((locations || []).map((l: any) => [l.user_id, l]))
        const haversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
          const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLng = (lng2 - lng1) * Math.PI / 180
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
          return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        }

        const nearbyUsers: NearbyUser[] = []
        for (const p of profiles as any[]) {
          const loc = locMap.get(p.id) as { lat: number; lng: number } | undefined
          if (!loc?.lat || !loc?.lng) continue
          const dist = haversine(myLoc.lat, myLoc.lng, loc.lat, loc.lng)
          if (dist <= 100) {
            nearbyUsers.push({ id: p.id, lat: loc.lat, lng: loc.lng, nome: p.nome || 'Usuário', distance_km: Math.round(dist * 10) / 10 })
          }
        }

        nearbyUsers.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
        setNearby(nearbyUsers.slice(0, 30))

        const { count } = await (supabase as any)
          .from('match_proposals')
          .select('id', { count: 'exact', head: true })
          .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
          .in('status', ['pending', 'accepted'])

        setMatchCount(count ?? 0)
      } catch (err) {
        console.error('[SimpleMatchSection]', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [supabase, userId, tipo])

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
      </div>
    )
  }

  if (!userLocation) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center gap-3 mb-3">
          <MapPin className="w-5 h-5 text-slate-500" />
          <h3 className="text-base font-bold text-white">Matches</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">Compartilhe sua localização para encontrar {tipo === 'consumidor' ? 'geradores' : 'consumidores'} próximos.</p>
        <Link href="/dashboard/match" className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300">
          Ir para Match <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    )
  }

  const markers: MapMarker[] = [
    {
      id: 'eu',
      lat: userLocation.lat,
      lng: userLocation.lng,
      label: 'Você',
      color: 'blue',
      pulse: true,
    },
    ...nearby.slice(0, 20).map((u) => ({
      id: u.id,
      lat: u.lat,
      lng: u.lng,
      label: u.nome,
      color: 'emerald' as const,
      popupHtml: `<strong>${u.nome}</strong><br/>${u.distance_km ? `${u.distance_km} km` : 'Distância desconhecida'}`,
    })),
  ]

  const label = tipo === 'consumidor' ? 'geradores' : 'consumidores'

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-bold text-white">Matches</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            <span className="text-2xl font-black text-emerald-400">{nearby.length}</span>
            {' '}{label} encontrados a 100 km
            {matchCount > 0 && <span className="text-slate-500 ml-2">· {matchCount} proposta{matchCount === 1 ? '' : 's'} ativa{matchCount === 1 ? '' : 's'}</span>}
          </p>
        </div>
        <Link
          href="/dashboard/match"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-sm text-white font-medium transition"
        >
          Ver todos <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {nearby.length > 0 && (
        <div className="mt-4">
          <MiniMap
            center={[userLocation.lat, userLocation.lng]}
            zoom={10}
            height="220px"
            markers={markers}
          />
        </div>
      )}
    </div>
  )
}
