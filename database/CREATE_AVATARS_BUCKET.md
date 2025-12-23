# Создание Storage Bucket для аватаров

## Выполните в Supabase Dashboard:

1. Перейдите в **Storage** → **Create a new bucket**
2. Настройки bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Включить (чтобы аватары были доступны по URL)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

3. После создания, настройте **RLS политики** для bucket:

```sql
-- Политика: Пользователи могут загружать только свои аватары
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политика: Пользователи могут обновлять только свои аватары
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политика: Пользователи могут удалять только свои аватары
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политика: Все могут просматривать аватары
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Структура хранения:

Файлы будут храниться по пути: `avatars/{user_id}/{filename}`

Например: `avatars/123e4567-e89b-12d3-a456-426614174000/avatar.jpg`

## Проверка:

После создания bucket должен быть доступен по URL:
`https://[YOUR_PROJECT].supabase.co/storage/v1/object/public/avatars/`

