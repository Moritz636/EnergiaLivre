'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase/singleton'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

const typeColors: Record<string, string> = {
  info: 'bg-blue-500/10 border-blue-500/30',
  success: 'bg-emerald-500/10 border-emerald-500/30',
  warning: 'bg-amber-500/10 border-amber-500/30',
  error: 'bg-red-500/10 border-red-500/30',
  payment: 'bg-purple-500/10 border-purple-500/30',
  commission: 'bg-yellow-500/10 border-yellow-500/30',
  lead: 'bg-cyan-500/10 border-cyan-500/30',
}

const typeIcons: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  payment: '💰',
  commission: '🪙',
  lead: '📋',
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabase()

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=15')
      const json = await res.json()
      if (json.success && Array.isArray(json.notifications)) {
        setNotifications(json.notifications)
        setUnreadCount(json.notifications.filter((n: Notification) => !n.read).length)
      }
    } catch (err) {
      console.error('[NotificationBell] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const notif = payload.new as Notification
          setNotifications((prev) => [notif, ...prev].slice(0, 15))
          setUnreadCount((prev) => prev + 1)
        },
      )
      .subscribe()

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [supabase, fetchNotifications])

  const markAsRead = async (notificationId?: number) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          notificationId
            ? { notificationId }
            : { markAllAsRead: true },
        ),
      })
      if (notificationId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n,
          ),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('[NotificationBell] markAsRead error:', err)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'agora'
    if (mins < 60) return `${mins}min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h3 className="text-sm font-semibold text-white">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[calc(70vh-52px)]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`relative px-4 py-3 border-b border-slate-800/50 transition-colors hover:bg-white/[0.02] ${notif.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-base leading-none">{typeIcons[notif.type] || '📢'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white truncate">{notif.title}</p>
                        <span className="shrink-0 text-[10px] text-slate-500 mt-0.5">{timeAgo(notif.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      {notif.link && !notif.read && (
                        <Link
                          href={notif.link}
                          onClick={() => markAsRead(notif.id)}
                          className="inline-block mt-1.5 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          Ver detalhes →
                        </Link>
                      )}
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="shrink-0 mt-1 p-1 rounded hover:bg-white/10 transition-colors"
                        title="Marcar como lida"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
