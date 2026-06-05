'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import ChatList from '@/components/Chat/ChatList'
import ChatWindow from '@/components/Chat/ChatWindow'
import CreateGroupModal from '@/components/Chat/CreateGroupModal'
import { Loader2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ChatConversationPage({ params }: PageProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showList, setShowList] = useState(true)

  useEffect(() => {
    params.then((p) => setConversationId(p.id))
  }, [params])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?from=' + (profile?.tipo ?? 'consumidor'))
    }
  }, [user, loading, profile, router])

  if (loading || !user || !conversationId) {
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
