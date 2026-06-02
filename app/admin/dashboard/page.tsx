'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut } from 'lucide-react'

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.replace('/admin-login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo')
        .eq('id', user.id)
        .single()

      if (profile?.tipo !== 'admin') {
        router.replace('/dashboard-consumidor')
        return
      }

      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-slate-400">Bem-vindo, Administrador</p>
          <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
          
          <div className="mt-8 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <p className="text-purple-400 text-sm">
              ✅ Você está logado como administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}