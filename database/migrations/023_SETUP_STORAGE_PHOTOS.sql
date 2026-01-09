-- ============================================
-- Настройка Storage bucket для фото прогресса
-- ============================================
-- Выполнить этот скрипт в Supabase SQL Editor

-- 1. Создаем bucket (если еще не создан)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'progress-photos',
    'progress-photos',
    false, -- приватный bucket
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 2. Включаем RLS для storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Удаляем старые политики если есть (чтобы не было конфликтов)
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all photos" ON storage.objects;

-- 4. Создаем политики для storage.objects

-- Загрузка: пользователь может загружать только в свою папку
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Просмотр: пользователь видит только свои фото
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Удаление: пользователь может удалять только свои фото
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Админы видят все фото
CREATE POLICY "Admins can view all photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'progress-photos'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- Готово!
-- ============================================

-- Проверка:
-- 1. SELECT * FROM storage.buckets WHERE id = 'progress-photos';
-- 2. SELECT * FROM pg_policies WHERE tablename = 'objects';
