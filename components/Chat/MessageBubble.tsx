'use client'

import { Check, CheckCheck, FileText, Download } from 'lucide-react'
import type { MessageRecord } from '@/lib/chat'
import { formatFileSize } from '@/lib/storage'

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface MessageBubbleProps {
  message: MessageRecord
  isOwn: boolean
  showAvatar: boolean
}

export default function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const time = formatTime(message.created_at)

  if (isOwn) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="bg-emerald-600 text-white px-3 py-2 rounded-2xl rounded-br-md shadow-sm">
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
            {message.attachment_url && (
              <AttachmentPreview message={message} />
            )}
          </div>
          <div className="flex items-center justify-end gap-1 mt-0.5 px-1">
            <span className="text-[10px] text-slate-500">{time}</span>
            <CheckCheck className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex justify-start ${!showAvatar ? 'pl-11' : ''}`}>
      <div className="max-w-[75%]">
        <div className="bg-white/10 text-slate-100 px-3 py-2 rounded-2xl rounded-bl-md shadow-sm">
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
          {message.attachment_url && (
            <AttachmentPreview message={message} />
          )}
        </div>
        <div className="mt-0.5 px-1">
          <span className="text-[10px] text-slate-500">{time}</span>
        </div>
      </div>
    </div>
  )
}

function AttachmentPreview({ message }: { message: MessageRecord }) {
  const isImage = message.attachment_type === 'image'
  const isPdf = message.attachment_type === 'pdf'

  if (isImage && message.attachment_url) {
    return (
      <a
        href={message.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-1.5 rounded-lg overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={message.attachment_url}
          alt={message.attachment_name ?? 'imagem'}
          className="max-w-full max-h-64 object-cover"
        />
      </a>
    )
  }

  return (
    <a
      href={message.attachment_url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 mt-1.5 p-2 rounded-lg bg-black/20 hover:bg-black/30 transition"
    >
      {isPdf ? (
        <FileText className="w-5 h-5 shrink-0" />
      ) : (
        <Download className="w-5 h-5 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">
          {message.attachment_name ?? 'Arquivo'}
        </p>
        {message.attachment_size != null && (
          <p className="text-[10px] opacity-70">
            {formatFileSize(message.attachment_size)}
          </p>
        )}
      </div>
    </a>
  )
}
