-- Migration 20260108: CHAT SYSTEM (limpa)
-- EnergiaLivre v2.3

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Funcao generica updated_at (nao falha se ja existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_group BOOLEAN NOT NULL DEFAULT false,
    name TEXT,
    avatar_url TEXT,
    match_id INTEGER REFERENCES match_proposals(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT name_required_for_groups CHECK (
        (is_group = false) OR (is_group = true AND name IS NOT NULL AND length(trim(name)) > 0)
    ),
    CONSTRAINT match_unique UNIQUE (match_id)
);

-- Tabela conversation_members
CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    muted BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (conversation_id, user_id)
);

-- Tabela messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    attachment_url TEXT,
    attachment_name TEXT,
    attachment_type TEXT CHECK (attachment_type IN ('image', 'pdf', 'file')),
    attachment_size INTEGER,
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_match ON conversations(match_id) WHERE match_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_conversations_is_group ON conversations(is_group);
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_conv ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_active ON messages(conversation_id, created_at DESC) WHERE deleted_at IS NULL;

-- Trigger last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-add criador
CREATE OR REPLACE FUNCTION auto_add_creator_to_conversation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO conversation_members (conversation_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'admin')
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_conv_last_msg ON messages;
CREATE TRIGGER trg_update_conv_last_msg
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

DROP TRIGGER IF EXISTS trg_auto_add_creator ON conversations;
CREATE TRIGGER trg_auto_add_creator
    AFTER INSERT ON conversations
    FOR EACH ROW EXECUTE FUNCTION auto_add_creator_to_conversation();

-- RLS habilitar
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies conversations
DROP POLICY IF EXISTS "Members can view conversations" ON conversations;
CREATE POLICY "Members can view conversations" ON conversations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM conversation_members
                WHERE conversation_members.conversation_id = conversations.id
                  AND conversation_members.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
CREATE POLICY "Authenticated users can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creator can update conversation" ON conversations;
CREATE POLICY "Creator can update conversation" ON conversations
    FOR UPDATE USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Creator can delete conversation" ON conversations;
CREATE POLICY "Creator can delete conversation" ON conversations
    FOR DELETE USING (created_by = auth.uid());

-- Policies conversation_members
DROP POLICY IF EXISTS "Members can view other members" ON conversation_members;
CREATE POLICY "Members can view other members" ON conversation_members
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM conversation_members cm
                WHERE cm.conversation_id = conversation_members.conversation_id
                  AND cm.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Creator or self can add members" ON conversation_members;
CREATE POLICY "Creator or self can add members" ON conversation_members
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM conversations c
                WHERE c.id = conversation_members.conversation_id
                  AND c.created_by = auth.uid())
        OR conversation_members.user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Members can update own membership" ON conversation_members;
CREATE POLICY "Members can update own membership" ON conversation_members
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Creator can remove members" ON conversation_members;
CREATE POLICY "Creator can remove members" ON conversation_members
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM conversations c
                   WHERE c.id = conversation_members.conversation_id
                     AND c.created_by = auth.uid())
    );

-- Policies messages
DROP POLICY IF EXISTS "Members can view messages" ON messages;
CREATE POLICY "Members can view messages" ON messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM conversation_members
                WHERE conversation_members.conversation_id = messages.conversation_id
                  AND conversation_members.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Members can send messages" ON messages;
CREATE POLICY "Members can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (SELECT 1 FROM conversation_members
                    WHERE conversation_members.conversation_id = messages.conversation_id
                      AND conversation_members.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Sender can edit messages" ON messages;
CREATE POLICY "Sender can edit messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- RPC: get_or_create_match_conversation
CREATE OR REPLACE FUNCTION get_or_create_match_conversation(
    p_match_id INTEGER,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_match RECORD;
    v_conversation_id UUID;
    v_other_user_id UUID;
BEGIN
    SELECT from_user_id, to_user_id, status INTO v_match
    FROM match_proposals WHERE id = p_match_id;

    IF v_match IS NULL THEN
        RAISE EXCEPTION 'Match % nao encontrado', p_match_id USING ERRCODE = 'P0002';
    END IF;

    IF v_match.status <> 'accepted' THEN
        RAISE EXCEPTION 'Match ainda nao foi aceito (status: %)', v_match.status USING ERRCODE = 'P0001';
    END IF;

    IF p_user_id <> v_match.from_user_id AND p_user_id <> v_match.to_user_id THEN
        RAISE EXCEPTION 'Usuario nao e participante deste match' USING ERRCODE = '42501';
    END IF;

    v_other_user_id := CASE
        WHEN p_user_id = v_match.from_user_id THEN v_match.to_user_id
        ELSE v_match.from_user_id
    END;

    SELECT id INTO v_conversation_id FROM conversations WHERE match_id = p_match_id;

    IF v_conversation_id IS NOT NULL THEN
        INSERT INTO conversation_members (conversation_id, user_id, role)
        VALUES (v_conversation_id, p_user_id, 'member')
        ON CONFLICT DO NOTHING;
        RETURN v_conversation_id;
    END IF;

    INSERT INTO conversations (is_group, match_id, created_by)
    VALUES (false, p_match_id, p_user_id)
    RETURNING id INTO v_conversation_id;

    INSERT INTO conversation_members (conversation_id, user_id, role)
    VALUES (v_conversation_id, v_other_user_id, 'member')
    ON CONFLICT DO NOTHING;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-attachments', 'chat-attachments', true, 10485760,
    ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif',
          'application/pdf','application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain','text/csv']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
DROP POLICY IF EXISTS "Chat attachments are publicly readable" ON storage.objects;
CREATE POLICY "Chat attachments are publicly readable" ON storage.objects
    FOR SELECT USING (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'chat-attachments'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = 'conversations'
    );

DROP POLICY IF EXISTS "Sender can delete own chat attachments" ON storage.objects;
CREATE POLICY "Sender can delete own chat attachments" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'chat-attachments'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

-- Realtime (best-effort, nao derruba o resto)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversation_members') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Realtime publication nao disponivel (ok)';
END $$;
