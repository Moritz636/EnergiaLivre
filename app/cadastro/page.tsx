'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cidade, setCidade] = useState('')
  const [password, setPassword] = useState('')
  const [tipo, setTipo] = useState<'consumidor' | 'gerador'>('consumidor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            tipo,
            whatsapp,
            cidade
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        await supabase.from('leads').insert({
          user_id: authData.user.id,
          nome,
          email,
          whatsapp,
          cidade,
          tipo,
          status: 'pendente'
        })

        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center bg-white/5 p-8 rounded-3xl border border-white/10">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Cadastro Realizado!</h1>
          <p className="text-slate-400">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Criar Conta</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Nome completo" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" 
            required 
          />
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" 
            required 
          />
          <input 
            type="tel" 
            placeholder="WhatsApp" 
            value={whatsapp} 
            onChange={e => setWhatsapp(e.target.value)} 
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" 
            required 
          />
          <input 
            type="text" 
            placeholder="Cidade - UF" 
            value={cidade} 
            onChange={e => setCidade(e.target.value)} 
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" 
            required 
          />
          <input 
            type="password" 
            placeholder="Senha (mínimo 6)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white" 
            required 
            minLength={6} 
          />
          
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => setTipo('consumidor')} 
              className={`flex-1 py-3 rounded-xl font-bold transition ${
                tipo === 'consumidor' 
                  ? 'bg-emerald-500 text-slate-900' 
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              Consumidor
            </button>
            <button 
              type="button" 
              onClick={() => setTipo('gerador')} 
              className={`flex-1 py-3 rounded-xl font-bold transition ${
                tipo === 'gerador' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              Gerador
            </button>
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}
          
          <button 
            disabled={loading} 
            className="w-full py-4 bg-emerald-500 text-slate-900 rounded-xl font-bold hover:bg-emerald-400 transition disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  )
}