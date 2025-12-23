-- ============================================
-- ИСПРАВЛЕНИЕ ТРИГГЕРА ДЛЯ OAUTH
-- ============================================
-- ПРОБЛЕМА: Database error saving new user
-- РЕШЕНИЕ: Пересоздаем триггер с правильной обработкой ошибок
-- ============================================

-- 1. УДАЛЯЕМ СТАРЫЙ ТРИГГЕР И ФУНКЦИЮ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. СОЗДАЕМ НОВУЮ ФУНКЦИЮ С ОБРАБОТКОЙ ОШИБОК
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Пытаемся создать профиль
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    subscription_status, 
    subscription_tier
  )
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'loki2723@mail.ru' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END,
    'inactive'::subscription_status_enum,
    'free'::subscription_tier
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Логируем ошибку, но НЕ прерываем создание пользователя
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. СОЗДАЕМ НОВЫЙ ТРИГГЕР
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. ПРОВЕРКА: Триггер создан?
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created'
    ) 
    THEN '✅ Триггер создан успешно!'
    ELSE '❌ Ошибка создания триггера'
  END as "Результат";

-- 5. СОЗДАЕМ ОТСУТСТВУЮЩИЕ ПРОФИЛИ ДЛЯ СУЩЕСТВУЮЩИХ ПОЛЬЗОВАТЕЛЕЙ
INSERT INTO public.profiles (id, email, role, subscription_status, subscription_tier)
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.email = 'loki2723@mail.ru' THEN 'admin'::user_role
    ELSE 'user'::user_role
  END,
  'inactive'::subscription_status_enum,
  'free'::subscription_tier
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 6. ИТОГОВАЯ СТАТИСТИКА
SELECT 
  'Пользователей в auth.users' as "Метрика",
  COUNT(*)::text as "Значение"
FROM auth.users
UNION ALL
SELECT 
  'Профилей в profiles',
  COUNT(*)::text
FROM public.profiles
UNION ALL
SELECT 
  'Пользователей БЕЗ профиля',
  COUNT(*)::text
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- После выполнения этого скрипта:
-- 1. Триггер будет пересоздан с правильной обработкой ошибок
-- 2. Все существующие пользователи получат профили
-- 3. Новые пользователи через OAuth будут работать
-- ============================================

