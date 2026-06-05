// ============================================
// STORAGE - UPLOAD HELPERS
// ============================================
// Helpers para upload de arquivos (anexos de chat, etc)
// ao Supabase Storage.
// ============================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import type { AttachmentType } from './chat'

const BUCKET = 'chat-attachments'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

const IMAGE_MIME = new Set([
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
])

const PDF_MIME = new Set(['application/pdf'])

export interface UploadResult {
  url: string
  path: string
  name: string
  type: AttachmentType
  size: number
}

/**
 * Faz upload de um arquivo para o bucket chat-attachments.
 * Path: conversations/{conversationId}/{userId}/{timestamp}-{filename}
 */
export async function uploadChatAttachment(
  supabase: SupabaseClient<Database>,
  file: File,
  conversationId: string,
  userId: string,
): Promise<UploadResult> {
  if (file.size > MAX_SIZE) {
    throw new Error(`Arquivo muito grande (máx 10MB). Recebido: ${(file.size / 1024 / 1024).toFixed(1)}MB`)
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 60)
  const path = `conversations/${conversationId}/${userId}/${Date.now()}-${safeName}`

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (uploadErr) throw uploadErr

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  let type: AttachmentType = 'file'
  if (IMAGE_MIME.has(file.type)) type = 'image'
  else if (PDF_MIME.has(file.type)) type = 'pdf'

  return {
    url: urlData.publicUrl,
    path,
    name: file.name,
    type,
    size: file.size,
  }
}

/**
 * Retorna a URL pública de um path no bucket.
 */
export function getChatAttachmentUrl(path: string): string {
  const sb = (typeof window !== 'undefined' && (window as any).__supabase)
  if (sb) {
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }
  // Fallback: constrói URL manualmente
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

/**
 * Formata bytes para display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
