-- ============================================
-- ДОБАВЛЕНИЕ ПОЛЕЙ ТЕЛЕФОНА И ФЛАГА ЗАПОЛНЕНИЯ ПРОФИЛЯ
-- ============================================
-- Добавляем:
-- - phone (номер телефона)
-- - profile_completed_at (дата заполнения профиля)
-- ============================================

-- 1. ДОБАВЛЯЕМ НОВЫЕ КОЛОНКИ
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz;

-- 2. ДОБАВЛЯЕМ КОММЕНТАРИИ
COMMENT ON COLUMN profiles.phone IS 
  'User phone number';

COMMENT ON COLUMN profiles.profile_completed_at IS 
  'Timestamp when user completed their profile for the first time';

-- 3. СОЗДАЕМ ИНДЕКС ДЛЯ ПОИСКА ПО ТЕЛЕФОНУ
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;

-- 4. ПРОВЕРКА РЕЗУЛЬТАТА
SELECT 
  email as "Email",
  full_name as "Полное имя",
  phone as "Телефон",
  CASE 
    WHEN profile_completed_at IS NOT NULL THEN '✅ Завершен'
    ELSE '⏳ Не завершен'
  END as "Статус профиля",
  created_at as "Дата создания"
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- После выполнения:
-- 1. ✅ Добавлена колонка phone
-- 2. ✅ Добавлена колонка profile_completed_at
-- 3. ✅ Создан индекс для поиска по телефону
-- ============================================

