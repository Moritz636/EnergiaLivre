-- ============================================
-- STORAGE BUCKET PARA FATURAS
-- ============================================
-- Cria bucket privado para upload de faturas
-- Cada usuario so ve suas proprias faturas

-- Criar bucket (se nao existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'faturas',
  'faturas',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: usuarios autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload faturas"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'faturas'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: usuarios so veem suas proprias faturas
CREATE POLICY "Users can view own faturas"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'faturas'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: usuarios podem deletar proprias faturas
CREATE POLICY "Users can delete own faturas"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'faturas'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: admin pode ver todas
CREATE POLICY "Admin can view all faturas"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'faturas'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
