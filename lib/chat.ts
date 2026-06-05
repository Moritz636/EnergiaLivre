// ============================================
// CHAT - TYPES & HELPERS (CLIENT-SIDE)
// ============================================
// Tipos compartilhados + helpers para consumir o chat
// diretamente do Supabase (com Realtime).
//
// As APIs server-side (app/api/chat/*) usam estes mesmos
// tipos para type-safety.
// ============================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Tipo permissivo: aceita o singleton tipado sem brigar com as variações
// de generics do SupabaseClient entre helpers e callers.
type AnySupabase = SupabaseClient<Database, any, any>

export type AttachmentType = 'image' | 'pdf' | 'file'

export interface ChatAttachment {
  url: string
  name: string
  type: AttachmentType
  size: number
}

export interface ConversationRecord {
  id: string
  is_group: boolean
  name: string | null
  avatar_url: string | null
  match_id: number | null
  created_by: string
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface ConversationMemberRecord {
  conversation_id: string
  user_id: string
  role: 'member' | 'admin'
  joined_at: string
  last_read_at: string | null
  muted: boolean
}

export interface MessageRecord {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachment_url: string | null
  attachment_name: string | null
  attachment_type: AttachmentType | null
  attachment_size: number | null
  edited_at: string | null
  deleted_at: string | null
  created_at: string
}

export interface ConversationWithMeta extends ConversationRecord {
  other_members: Array<{
    user_id: string
    nome: string | null
    avatar_url: string | null
  }>
  unread_count: number
  last_message_preview: string | null
}

// ============================================
// HELPERS
// ============================================

/**
 * Lista as conversas do usuário, ordenadas por última mensagem.
 * Inclui metadados (outros membros, contagem de não lidas, preview).
 */
export async function listConversations(
  supabase: AnySupabase,
  userId: string,
): Promise<ConversationWithMeta[]> {
  // 1) Buscar memberships
  const { data: memberships, error: memErr } = await supabase
    .from('conversation_members')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

  if (memErr) throw memErr
  if (!memberships || memberships.length === 0) return []

  const conversationIds = memberships.map((m) => m.conversation_id)
  const lastReadMap = new Map(memberships.map((m) => [m.conversation_id, m.last_read_at]))

  // 2) Buscar conversas
  const { data: conversations, error: convErr } = await supabase
    .from('conversations')
    .select('*')
    .in('id', conversationIds)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (convErr) throw convErr
  if (!conversations) return []

  // 3) Buscar membros + profiles
  const { data: allMembers, error: mErr } = await supabase
    .from('conversation_members')
    .select('conversation_id, user_id, profiles!inner(nome, avatar_url)')
    .in('conversation_id', conversationIds)
    .neq('user_id', userId)

  if (mErr) throw mErr

  // 4) Buscar última mensagem por conversa
  const { data: lastMessages, error: lmErr } = await supabase
    .from('messages')
    .select('conversation_id, content, created_at, deleted_at')
    .in('conversation_id', conversationIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(conversationIds.length * 5) // Pega as 5 últimas de cada aprox

  if (lmErr) throw lmErr

  // 5) Contar não lidas
  const unreadByConv = new Map<string, number>()
  for (const m of lastMessages ?? []) {
    const lastRead = lastReadMap.get(m.conversation_id)
    if (!lastRead || new Date(m.created_at) > new Date(lastRead)) {
      unreadByConv.set(m.conversation_id, (unreadByConv.get(m.conversation_id) ?? 0) + 1)
    }
  }

  // 6) Combinar tudo
  const membersByConv = new Map<string, Array<any>>()
  for (const m of allMembers ?? []) {
    const list = membersByConv.get(m.conversation_id) ?? []
    list.push({
      user_id: m.user_id,
      nome: (m.profiles as any)?.nome ?? null,
      avatar_url: (m.profiles as any)?.avatar_url ?? null,
    })
    membersByConv.set(m.conversation_id, list)
  }

  const lastMsgByConv = new Map<string, any>()
  for (const m of lastMessages ?? []) {
    if (!lastMsgByConv.has(m.conversation_id)) {
      lastMsgByConv.set(m.conversation_id, m)
    }
  }

  return (conversations as ConversationRecord[]).map((c) => {
    const last = lastMsgByConv.get(c.id)
    return {
      ...c,
      other_members: membersByConv.get(c.id) ?? [],
      unread_count: unreadByConv.get(c.id) ?? 0,
      last_message_preview: last
        ? last.content || (last.attachment_name ? `📎 ${last.attachment_name}` : 'Sem mensagens')
        : null,
    }
  })
}

/**
 * Retorna (ou cria) a conversa 1-1 de um match aceito.
 */
export async function getOrCreateMatchConversation(
  supabase: AnySupabase,
  matchId: number,
  userId: string,
): Promise<string> {
  // Chama a RPC que valida e cria se necessário
  const { data, error } = await (supabase.rpc as any)(
    'get_or_create_match_conversation',
    { p_match_id: matchId, p_user_id: userId },
  )

  if (error) throw error
  if (!data) throw new Error('Não foi possível obter a conversa')
  return data as string
}

/**
 * Lista mensagens de uma conversa (paginação por cursor de tempo).
 */
export async function listMessages(
  supabase: AnySupabase,
  conversationId: string,
  options: { limit?: number; before?: string } = {},
): Promise<MessageRecord[]> {
  const limit = options.limit ?? 50
  let q = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (options.before) {
    q = q.lt('created_at', options.before)
  }

  const { data, error } = await q
  if (error) throw error

  // Devolve em ordem cronológica (mais antiga primeiro)
  return ((data ?? []) as MessageRecord[]).reverse()
}

/**
 * Envia uma mensagem (texto + anexo opcional).
 */
export async function sendMessage(
  supabase: AnySupabase,
  input: {
    conversationId: string
    senderId: string
    content: string
    attachment?: ChatAttachment | null
  },
): Promise<MessageRecord> {
  if (!input.content.trim() && !input.attachment) {
    throw new Error('Mensagem vazia')
  }

  const row = {
    conversation_id: input.conversationId,
    sender_id: input.senderId,
    content: input.content.trim(),
    attachment_url: input.attachment?.url ?? null,
    attachment_name: input.attachment?.name ?? null,
    attachment_type: input.attachment?.type ?? null,
    attachment_size: input.attachment?.size ?? null,
  }

  const { data, error } = await (supabase
    .from('messages') as any)
    .insert(row)
    .select('*')
    .single()

  if (error) throw error
  return data as MessageRecord
}

/**
 * Marca todas as mensagens de uma conversa como lidas (atualiza last_read_at).
 */
export async function markConversationAsRead(
  supabase: AnySupabase,
  conversationId: string,
  userId: string,
): Promise<void> {
  const { error } = await (supabase
    .from('conversation_members') as any)
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Cria uma conversa em grupo.
 */
export async function createGroupConversation(
  supabase: AnySupabase,
  input: {
    name: string
    createdBy: string
    memberIds: string[]
  },
): Promise<string> {
  if (input.memberIds.length < 1) {
    throw new Error('Grupo precisa ter pelo menos 1 outro membro')
  }

  const { data: conv, error: convErr } = await (supabase
    .from('conversations') as any)
    .insert({
      is_group: true,
      name: input.name.trim(),
      created_by: input.createdBy,
    })
    .select('id')
    .single()

  if (convErr) throw convErr

  const conversationId = conv.id as string

  // Adicionar membros (sem o criador — o trigger já adiciona)
  const others = input.memberIds.filter((id) => id !== input.createdBy)
  if (others.length > 0) {
    const { error: mErr } = await (supabase
      .from('conversation_members') as any)
      .insert(others.map((uid) => ({
        conversation_id: conversationId,
        user_id: uid,
        role: 'member',
      })))
    if (mErr) throw mErr
  }

  return conversationId
}

/**
 * Adiciona um membro a um grupo existente.
 */
export async function addMemberToGroup(
  supabase: AnySupabase,
  conversationId: string,
  userId: string,
): Promise<void> {
  const { error } = await (supabase
    .from('conversation_members') as any)
    .insert({ conversation_id: conversationId, user_id: userId, role: 'member' })

  if (error && !error.message.includes('duplicate')) throw error
}

/**
 * Remove um membro de um grupo.
 */
export async function removeMemberFromGroup(
  supabase: AnySupabase,
  conversationId: string,
  userId: string,
): Promise<void> {
  const { error } = await (supabase
    .from('conversation_members') as any)
    .delete()
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Busca lista de usuários para adicionar a um grupo.
 * Filtra por nome (case-insensitive).
 */
export async function searchUsers(
  supabase: AnySupabase,
  query: string,
  excludeIds: string[] = [],
  limit = 20,
): Promise<Array<{ id: string; nome: string; tipo: string; cidade: string | null }>> {
  if (!query || query.length < 2) return []

  let q = supabase
    .from('profiles')
    .select('id, nome, tipo, cidade')
    .ilike('nome', `%${query}%`)
    .eq('is_active', true)
    .limit(limit)

  if (excludeIds.length > 0) {
    q = (q as any).not('id', 'in', `(${excludeIds.map((id) => `"${id}"`).join(',')})`)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as any
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

/**
 * Inscreve para receber novas mensagens de uma conversa.
 * Retorna função de cleanup.
 */
export function subscribeToMessages(
  supabase: AnySupabase,
  conversationId: string,
  onMessage: (msg: MessageRecord) => void,
): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new) {
          onMessage(payload.new as MessageRecord)
        }
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Inscreve para receber updates de last_message_at das conversas do user.
 */
export function subscribeToConversations(
  supabase: AnySupabase,
  userId: string,
  onUpdate: () => void,
): () => void {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      },
      () => {
        onUpdate()
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      () => {
        onUpdate()
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
