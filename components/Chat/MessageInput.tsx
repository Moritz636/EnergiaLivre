'use client'

import { useState, useRef } from 'react'
import { Send, Paperclip, X, Loader2, FileText, Image as ImageIcon } from 'lucide-react'
import { getSupabase } from '@/lib/supabase/singleton'
import { formatFileSize } from '@/lib/storage'
import type { AttachmentType } from '@/lib/chat'

interface MessageInputProps {
  conversationId: string
  onSend: (content: string, attachment: UploadedAttachment | null) => Promise<void> | void
  disabled?: boolean
}

export interface UploadedAttachment {
  url: string
  name: string
  type: AttachmentType
  size: number
}

const MAX_SIZE = 10 * 1024 * 1024

export default function MessageInput({ conversationId, onSend, disabled }: MessageInputProps) {
  const supabase = getSupabase()
  const [content, setContent] = useState('')
  const [attachment, setAttachment] = useState<UploadedAttachment | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > MAX_SIZE) {
      setError(`Arquivo muito grande (máx 10MB). Recebido: ${(file.size / 1024 / 1024).toFixed(1)}MB`)
      return
    }
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('conversationId', conversationId)
      const res = await fetch('/api/chat/upload', { method: 'POST', body: fd })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro no upload')
      setAttachment(body.attachment)
    } catch (err: any) {
      setError(err?.message || 'Erro no upload')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSend = async () => {
    if (disabled || uploading) return
    if (!content.trim() && !attachment) return
    const text = content
    const att = attachment
    setContent('')
    setAttachment(null)
    setError('')
    try {
      await onSend(text, att)
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-white/10 p-3 bg-[#020617]">
      {error && (
        <div className="mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      )}

      {attachment && (
        <div className="mb-2 p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
          {attachment.type === 'image' ? (
            <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">{attachment.name}</p>
            <p className="text-[10px] text-slate-500">{formatFileSize(attachment.size)}</p>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="p-1 rounded hover:bg-white/10 shrink-0"
            aria-label="Remover anexo"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
          }}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || disabled}
          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition disabled:opacity-50 shrink-0"
          aria-label="Anexar arquivo"
          title="Anexar (imagem, PDF ou documento)"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </button>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 max-h-32"
          style={{
            minHeight: '40px',
            height: 'auto',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || uploading || (!content.trim() && !attachment)}
          className="p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#020617] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Enviar"
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
