'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  LogOut,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
  BarChart3,
  UserCheck,
  Zap
} from 'lucide-react'
const ADMIN_EMAIL = 'jullio.cesarmcdo@gmail.com' // ✅ NOVO EMAIL
interface Lead {
  id: number
  nome: string
  email: string
  whatsapp: string
  cidade: string
  tipo: string
  status: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/admin-login')
      return
    }

    // Verificar se é admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('email')
      .eq('email', user.email)
      .single()

    if (!adminData) {
      router.push('/')
      return
    }

    setUser(user)
    loadLeads()
  }

  const loadLeads = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setLeads(data)
    setLoading(false)
  }

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)

    if (!error) loadLeads()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin-login')
  }

  const filteredLeads = leads.filter(lead => {
    if (filter === 'pendentes') return lead.status === 'pendente' || !lead.status
    if (filter === 'aprovados') return lead.status === 'aprovado'
    if (filter === 'recusados') return lead.status === 'recusado'
    return true
  }).filter(lead => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      lead.nome?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.whatsapp?.includes(term) ||
      lead.cidade?.toLowerCase().includes(term)
    )
  })

  const stats = {
    total: leads.length,
    pendentes: leads.filter(l => l.status === 'pendente' || !l.status).length,
    aprovados: leads.filter(l => l.status === 'aprovado').length,
    recusados: leads.filter(l => l.status === 'recusado').length,
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-900/90 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-white">ENERGIA<span className="text-purple-500">LIVRE</span></span>
            <div className="ml-3 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] font-bold text-purple-300 uppercase">
              Admin
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
              <Shield className="w-4 h-4 text-purple-500" />
              <span>{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
            <p className="text-slate-400">Gerencie leads, visualize estatísticas e controle o sistema</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30">
              <Users className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-3xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total de Leads</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30">
              <Clock className="w-6 h-6 text-yellow-400 mb-2" />
              <p className="text-3xl font-bold text-white">{stats.pendentes}</p>
              <p className="text-xs text-slate-400">Pendentes</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/30">
              <CheckCircle className="w-6 h-6 text-emerald-400 mb-2" />
              <p className="text-3xl font-bold text-white">{stats.aprovados}</p>
              <p className="text-xs text-slate-400">Aprovados</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30">
              <XCircle className="w-6 h-6 text-red-400 mb-2" />
              <p className="text-3xl font-bold text-white">{stats.recusados}</p>
              <p className="text-xs text-slate-400">Recusados</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('todos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'todos' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pendentes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'pendentes' 
                    ? 'bg-yellow-500 text-slate-900' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Pendentes ({stats.pendentes})
              </button>
              <button
                onClick={() => setFilter('aprovados')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'aprovados' 
                    ? 'bg-emerald-500 text-slate-900' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Aprovados ({stats.aprovados})
              </button>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail, WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
              />
            </div>
            <button
              onClick={loadLeads}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:bg-white/10 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Atualizar
            </button>
          </div>

          {/* Leads Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr className="text-left text-slate-400 text-sm">
                    <th className="p-4">Data</th>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Contato</th>
                    <th className="p-4">Local</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Nenhum lead encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="p-4 text-slate-500 text-sm">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 font-medium text-white">{lead.nome || '-'}</td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-slate-300">
                              <Mail className="w-3 h-3" /> {lead.email || '-'}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-300">
                              <Phone className="w-3 h-3" /> {lead.whatsapp || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-slate-300 text-sm">
                            <MapPin className="w-3 h-3" /> {lead.cidade || '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lead.tipo === 'gerador' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {lead.tipo === 'gerador' ? '⚡ Gerador' : '💰 Consumidor'}
                          </span>
                        </td>
                        <td className="p-4">
                          {lead.status === 'aprovado' && (
                            <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" /> Aprovado
                            </span>
                          )}
                          {lead.status === 'recusado' && (
                            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" /> Recusado
                            </span>
                          )}
                          {(lead.status === 'pendente' || !lead.status) && (
                            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" /> Pendente
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {(lead.status === 'pendente' || !lead.status) && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateStatus(lead.id, 'aprovado')}
                                className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition"
                                title="Aprovar"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateStatus(lead.id, 'recusado')}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                                title="Recusar"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}