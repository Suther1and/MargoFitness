-- ============================================
-- БЫСТРАЯ ПРОВЕРКА БД ДЛЯ OAUTH
-- Скопируйте этот запрос в Supabase SQL Editor
-- ============================================

-- 1. ПРОВЕРКА: Есть ли пользователи в auth.users?
SELECT 
  '1. ПОЛЬЗОВАТЕЛИ В AUTH.USERS' as "Проверка",
  COUNT(*) as "Количество"
FROM auth.users;

-- 2. СПИСОК всех пользователей
SELECT 
  email as "Email",
  created_at as "Дата создания",
  confirmed_at as "Email подтвержден",
  last_sign_in_at as "Последний вход"
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 3. ПРОВЕРКА: Есть ли профили в profiles?
SELECT 
  '3. ПРОФИЛИ В PROFILES' as "Проверка",
  COUNT(*) as "Количество"
FROM profiles;

-- 4. СПИСОК всех профилей
SELECT 
  email as "Email",
  role as "Роль",
  subscription_tier as "Тариф",
  subscription_status as "Статус подписки",
  created_at as "Дата создания"
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 5. КРИТИЧНО: Пользователи БЕЗ профилей
SELECT 
  '5. ❌ ПОЛЬЗОВАТЕЛИ БЕЗ ПРОФИЛЕЙ' as "Проверка",
  COUNT(*) as "Количество пользователей без профиля"
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 6. СПИСОК пользователей без профилей
SELECT 
  au.email as "Email без профиля",
  au.created_at as "Дата регистрации"
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 7. ПРОВЕРКА: Существует ли триггер?
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created'
    ) 
    THEN '✅ Триггер существует'
    ELSE '❌ ТРИГГЕР НЕ НАЙДЕН - ЭТО ПРОБЛЕМА!'
  END as "Статус триггера";

-- 8. ПРОВЕРКА: Существует ли функция триггера?
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'handle_new_user'
    ) 
    THEN '✅ Функция существует'
    ELSE '❌ ФУНКЦИЯ НЕ НАЙДЕНА - ЭТО ПРОБЛЕМА!'
  END as "Статус функции";

-- ============================================
-- ЕСЛИ НАШЛИ ПОЛЬЗОВАТЕЛЕЙ БЕЗ ПРОФИЛЕЙ
-- Запустите этот блок ниже:
-- ============================================

-- СОЗДАНИЕ ОТСУТСТВУЮЩИХ ПРОФИЛЕЙ
INSERT INTO profiles (id, email, role, subscription_status, subscription_tier)
SELECT 
  au.id,
  au.email,
  'user',
  'inactive',
  'free'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Проверка результата
SELECT 
  '✅ ПРОФИЛИ СОЗДАНЫ!' as "Результат",
  COUNT(*) as "Количество созданных профилей"
FROM auth.users au
INNER JOIN profiles p ON au.id = p.id
WHERE p.created_at > NOW() - INTERVAL '1 minute';

-- ============================================
-- ИТОГОВАЯ СТАТИСТИКА
-- ============================================
SELECT 
  'Всего пользователей' as "Метрика",
  COUNT(*) as "Значение"
FROM auth.users
UNION ALL
SELECT 
  'Всего профилей',
  COUNT(*)
FROM profiles
UNION ALL
SELECT 
  'Пользователей БЕЗ профиля',
  COUNT(*)
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 
  'Пользователей С профилем',
  COUNT(*)
FROM auth.users au
INNER JOIN profiles p ON au.id = p.id;

