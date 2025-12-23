-- ============================================
-- ОБНОВЛЕНИЕ ТРИГГЕРА ДЛЯ OAUTH
-- ============================================
-- Обновляем триггер чтобы он работал с новыми полями
-- и корректно сохранял аватар и имя из Google OAuth
-- ============================================

-- 1. УДАЛЯЕМ СТАРЫЙ ТРИГГЕР И ФУНКЦИЮ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. СОЗДАЕМ ОБНОВЛЕННУЮ ФУНКЦИЮ
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
    phone,
    profile_completed_at,
    role, 
    subscription_status, 
    subscription_tier
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_avatar,
    NULL, -- phone пока не заполняем
    NULL, -- profile_completed_at будет установлен когда пользователь заполнит форму
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
    email = COALESCE(EXCLUDED.email, profiles.email),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create/update profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. СОЗДАЕМ ТРИГГЕР
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. ОБНОВЛЯЕМ СУЩЕСТВУЮЩИЕ ПРОФИЛИ (если есть новые пользователи без аватара)
UPDATE public.profiles p
SET 
  full_name = COALESCE(
    p.full_name, -- Оставляем если уже есть
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name'
  ),
  avatar_url = COALESCE(
    p.avatar_url, -- Оставляем если уже есть
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  ),
  updated_at = NOW()
FROM auth.users au
WHERE p.id = au.id
  AND (
    (p.full_name IS NULL AND au.raw_user_meta_data->>'full_name' IS NOT NULL)
    OR (p.avatar_url IS NULL AND au.raw_user_meta_data->>'picture' IS NOT NULL)
  );

-- 5. ПРОВЕРКА РЕЗУЛЬТАТА
SELECT 
  email as "Email",
  full_name as "Имя",
  CASE 
    WHEN avatar_url IS NOT NULL THEN '✅ Есть'
    ELSE '❌ Нет'
  END as "Аватар",
  phone as "Телефон",
  CASE 
    WHEN profile_completed_at IS NOT NULL THEN '✅ Завершен'
    ELSE '⏳ Не завершен'
  END as "Профиль",
  created_at as "Создан"
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- После выполнения:
-- 1. ✅ Триггер обновлен для работы с новыми полями
-- 2. ✅ OAuth данные (имя, аватар) будут сохраняться автоматически
-- 3. ✅ Существующие профили обновлены
-- ============================================

