'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ChatRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/match')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
    </div>
  )
}
