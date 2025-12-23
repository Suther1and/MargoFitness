-- ============================================
-- ДОБАВЛЕНИЕ ПОЛЕЙ ПРОФИЛЯ ДЛЯ OAUTH
-- ============================================
-- Добавляем поля для хранения данных из Google OAuth:
-- - full_name (полное имя)
-- - avatar_url (URL аватара)
-- ============================================

-- 1. ДОБАВЛЯЕМ НОВЫЕ КОЛОНКИ В PROFILES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. ДОБАВЛЯЕМ КОММЕНТАРИИ
COMMENT ON COLUMN profiles.full_name IS 
  'User full name from OAuth provider (Google, etc.)';

COMMENT ON COLUMN profiles.avatar_url IS 
  'User avatar URL from OAuth provider';

-- 3. ОБНОВЛЯЕМ ТРИГГЕР ДЛЯ АВТОМАТИЧЕСКОГО СОХРАНЕНИЯ ДАННЫХ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_full_name text;
  user_avatar text;
BEGIN
  -- Извлекаем данные из метаданных пользователя
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NULL
  );
  
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  -- Создаем профиль с расширенными данными
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    avatar_url,
    role, 
    subscription_status, 
    subscription_tier
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_avatar,
    CASE 
      WHEN NEW.email = 'loki2723@mail.ru' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END,
    'inactive'::subscription_status_enum,
    'free'::subscription_tier
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    email = COALESCE(EXCLUDED.email, profiles.email);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create/update profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. ОБНОВЛЯЕМ СУЩЕСТВУЮЩИЕ ПРОФИЛИ (заполняем данные из auth.users)
UPDATE public.profiles p
SET 
  full_name = COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    p.full_name
  ),
  avatar_url = COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture',
    p.avatar_url
  )
FROM auth.users au
WHERE p.id = au.id
  AND (p.full_name IS NULL OR p.avatar_url IS NULL);

-- 5. ПРОВЕРКА РЕЗУЛЬТАТА
SELECT 
  email as "Email",
  full_name as "Полное имя",
  CASE 
    WHEN avatar_url IS NOT NULL THEN '✅ Есть аватар'
    ELSE '❌ Нет аватара'
  END as "Аватар",
  role as "Роль",
  created_at as "Дата создания"
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- После выполнения:
-- 1. ✅ Добавлены колонки full_name и avatar_url
-- 2. ✅ Триггер обновлен - теперь сохраняет имя и аватар
-- 3. ✅ Существующие профили обновлены
-- 4. ✅ При следующем входе через Google будут сохраняться все данные
-- ============================================

