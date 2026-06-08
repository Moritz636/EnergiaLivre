'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import ChatList from '@/components/Chat/ChatList'
import ChatWindow from '@/components/Chat/ChatWindow'
import CreateGroupModal from '@/components/Chat/CreateGroupModal'
import { Loader2 } from 'lucide-react'

// ============================================================
// CHAT — conversa individual (exclusivo Parceiro)
// Mesma regra do /dashboard/chat: só abre para tipo=parceiro
// (ou role=admin). Consumidores/geradores são redirecionados.
// ============================================================

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ChatConversationPage({ params }: PageProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showList, setShowList] = useState(true)
  const [accessChecked, setAccessChecked] = useState(false)

  useEffect(() => {
    params.then((p) => setConversationId(p.id))
  }, [params])

  // Auth → /login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?from=parceiro')
    }
  }, [user, loading, router])

  // Role check → redireciona quem não é parceiro
  useEffect(() => {
    if (loading || !user || !profile) return
    const isEmbaixador =
      profile.tipo === 'parceiro' || (profile as any).role === 'admin'
    if (!isEmbaixador) {
      const target =
        profile.tipo === 'gerador'
          ? '/dashboard-gerador'
          : '/dashboard-consumidor'
      router.replace(target)
      return
    }
    setAccessChecked(true)
  }, [loading, user, profile, router])

  if (loading || !user || !conversationId || !accessChecked) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden h-[calc(100vh-3rem)]">
          <div className="grid md:grid-cols-[320px,1fr] h-full">
            <aside
              className={`${
                showList ? 'block' : 'hidden'
              } md:block border-r border-white/10 h-full overflow-hidden`}
            >
              <ChatList
                activeId={conversationId}
                onSelect={(id) => {
                  router.push(`/dashboard/chat/${id}`)
                  setShowList(false)
                }}
                showBackButton
                onCreateGroup={() => setShowCreateGroup(true)}
              />
            </aside>
            <section
              className={`${
                showList ? 'hidden' : 'block'
              } md:block h-full overflow-hidden`}
            >
              <ChatWindow
                conversationId={conversationId}
                onBack={() => setShowList(true)}
              />
            </section>
          </div>
        </div>
      </main>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreated={(id) => {
            setShowCreateGroup(false)
            router.push(`/dashboard/chat/${id}`)
          }}
        />
      )}
    </div>
  )
}
