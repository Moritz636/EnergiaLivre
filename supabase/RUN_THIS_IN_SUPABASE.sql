-- ============================================
-- MIGRAÇÃO COMPLETA: FATURAS
-- Storage bucket + Tabela de uploads
-- Rode no: Supabase > SQL Editor > New Query
-- ============================================

-- 1. CRIAR BUCKET DE STORAGE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'faturas',
  'faturas',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. POLICIES DO BUCKET
CREATE POLICY "Authenticated users can upload faturas"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'faturas' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own faturas"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'faturas' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own faturas"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'faturas' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admin can view all faturas"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'faturas' AND EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- 3. CRIAR TABELA DE UPLOADS (se não existir)
CREATE TABLE IF NOT EXISTS faturas_upload (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT,
  file_type TEXT,
  file_name TEXT,
  consumo_kwh NUMERIC,
  distribuidora TEXT,
  estado TEXT(2),
  valor NUMERIC,
  vencimento TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_faturas_upload_user ON faturas_upload(user_id);
CREATE INDEX IF NOT EXISTS idx_faturas_upload_status ON faturas_upload(status);

-- 5. RLS
ALTER TABLE faturas_upload ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads"
ON faturas_upload FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own uploads"
ON faturas_upload FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all uploads"
ON faturas_upload FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admin can update all uploads"
ON faturas_upload FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- 6. TRIGGER UPDATED_AT
CREATE OR REPLACE FUNCTION update_faturas_upload_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_faturas_upload_updated_at ON faturas_upload;
CREATE TRIGGER update_faturas_upload_updated_at
BEFORE UPDATE ON faturas_upload
FOR EACH ROW EXECUTE FUNCTION update_faturas_upload_updated_at();
