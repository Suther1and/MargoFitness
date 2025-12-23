-- ============================================
-- GOOGLE OAUTH DIAGNOSTICS
-- Скрипт для диагностики проблем с OAuth
-- ============================================

-- ============================================
-- 1. ПРОВЕРКА ПОЛЬЗОВАТЕЛЕЙ БЕЗ ПРОФИЛЕЙ
-- ============================================

SELECT 
  au.id,
  au.email,
  au.created_at as "Зарегистрирован",
  CASE 
    WHEN p.id IS NULL THEN '❌ НЕТ ПРОФИЛЯ'
    ELSE '✅ Профиль есть'
  END as "Статус профиля"
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- ============================================
-- 2. СОЗДАНИЕ ОТСУТСТВУЮЩИХ ПРОФИЛЕЙ
-- ============================================

-- Создает профили для всех пользователей, у которых их нет
INSERT INTO public.profiles (id, email, role, subscription_status, subscription_tier)
SELECT 
  au.id, 
  au.email, 
  'user', 
  'inactive', 
  'free'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Сообщение о результате
SELECT 
  COUNT(*) as "Создано профилей"
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ============================================
-- 3. ПРОВЕРКА ТРИГГЕРА
-- ============================================

-- Проверяем, существует ли триггер
SELECT 
  t.tgname as "Имя триггера",
  CASE 
    WHEN t.tgname IS NOT NULL THEN '✅ Триггер существует'
    ELSE '❌ Триггер не найден'
  END as "Статус"
FROM pg_trigger t
WHERE t.tgname = 'on_auth_user_created'
UNION ALL
SELECT 
  'handle_new_user' as "Имя триггера",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN '✅ Функция существует'
    ELSE '❌ Функция не найдена'
  END as "Статус";

-- ============================================
-- 4. ПЕРЕСОЗДАНИЕ ТРИГГЕРА (если нужно)
-- ============================================

-- Удаляем старый триггер
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Создаем новую функцию с обработкой конфликтов
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, subscription_status, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'loki2723@mail.ru' THEN 'admin'
      ELSE 'user' 
    END,
    'inactive',
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Логируем ошибку, но не прерываем регистрацию
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем новый триггер
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 5. ПРОВЕРКА RLS ПОЛИТИК
-- ============================================

SELECT 
  schemaname as "Схема",
  tablename as "Таблица",
  policyname as "Политика",
  cmd as "Команда",
  CASE 
    WHEN roles = '{authenticated}' THEN '✅ Authenticated'
    WHEN roles = '{service_role}' THEN '🔧 Service Role'
    ELSE roles::text
  END as "Роли"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- 6. ТЕСТОВАЯ ПРОВЕРКА ДОСТУПА
-- ============================================

-- Проверяем, может ли текущий пользователь создать профиль
DO $$
DECLARE
  test_user_id uuid := auth.uid();
  test_email text := (SELECT email FROM auth.users WHERE id = test_user_id);
BEGIN
  IF test_user_id IS NULL THEN
    RAISE NOTICE '❌ Нет активной сессии - запустите из приложения';
  ELSE
    RAISE NOTICE '✅ Текущий пользователь: % (%)', test_email, test_user_id;
    
    -- Пробуем создать тестовый профиль (если его нет)
    INSERT INTO public.profiles (id, email, role, subscription_status, subscription_tier)
    VALUES (test_user_id, test_email, 'user', 'inactive', 'free')
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Профиль создан или уже существует';
  END IF;
END $$;

-- ============================================
-- 7. СТАТИСТИКА
-- ============================================

SELECT 
  'Всего пользователей' as "Метрика",
  COUNT(*) as "Значение"
FROM auth.users
UNION ALL
SELECT 
  'Всего профилей',
  COUNT(*)
FROM public.profiles
UNION ALL
SELECT 
  'Пользователей без профиля',
  COUNT(*)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 
  'Админов',
  COUNT(*)
FROM public.profiles
WHERE role = 'admin';

-- ============================================
-- 8. ПОСЛЕДНИЕ 10 ПОЛЬЗОВАТЕЛЕЙ
-- ============================================

SELECT 
  au.email as "Email",
  au.created_at as "Регистрация",
  p.role as "Роль",
  p.subscription_tier as "Тариф",
  CASE 
    WHEN p.id IS NULL THEN '❌ НЕТ ПРОФИЛЯ'
    ELSE '✅'
  END as "Профиль"
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Этот скрипт:
-- 1. Проверяет пользователей без профилей
-- 2. Создает отсутствующие профили
-- 3. Проверяет триггер и функцию
-- 4. Пересоздает триггер с обработкой ошибок
-- 5. Проверяет RLS политики
-- 6. Показывает статистику
-- 7. Показывает последних пользователей
-- ============================================

