'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Email ou senha incorretos')
      setLoading(false)
      return
    }

    if (data.user) {
      window.location.href = '/dashboard-consumidor'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white"
            required
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}