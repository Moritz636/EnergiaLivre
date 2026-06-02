'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Loader2 } from 'lucide-react'

const ADMIN_EMAIL = 'energialivreofc@gmail.com'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Verifica se já está logado como admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tipo')
          .eq('id', user.id)
          .single()
        
        if (profile?.tipo === 'admin') {
          router.replace('/admin/dashboard')
          return
        }
      }
      setChecking(false)
    }
    
    checkAdmin()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Verifica credenciais
      if (password !== 'adm123') {
        throw new Error('Senha incorreta')
      }

      // Tenta login
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: password,
      })

      // Se usuário não existir, cria
      if (signInError && signInError.message.includes('Invalid')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: password,
          options: {
            data: { 
              nome: 'Administrador', 
              tipo: 'admin',
              whatsapp: '',
              cidade: ''
            }
          }
        })

        if (signUpError) throw signUpError

        // Cria o perfil manualmente se o trigger não funcionar
        if (signUpData.user) {
          await supabase.from('profiles').insert({
            id: signUpData.user.id,
            email: ADMIN_EMAIL,
            nome: 'Administrador',
            tipo: 'admin',
            whatsapp: '',
            cidade: '',
            status_assinatura: 'active'
          })
        }

        // Login após criação
        await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: password,
        })
      }

      // Redirecionamento forçado
      router.push('/admin/dashboard')
      
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-slate-400 text-sm mt-2">Acesso restrito</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2">E-mail</label>
            <input
              type="email"
              value={ADMIN_EMAIL}
              disabled
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-slate-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-purple-500 outline-none"
              placeholder="Digite a senha"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-400 hover:to-pink-400 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-slate-500 text-sm hover:text-purple-400 transition">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  )
}