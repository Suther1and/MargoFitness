-- Проверка успешности миграции 013
-- Скопируйте этот запрос и выполните в Supabase SQL Editor

-- 1. Проверяем созданные таблицы
SELECT 
  'Таблицы созданы' as check_type,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_bonuses', 'bonus_transactions', 'referral_codes', 'referrals', 'promo_codes')
ORDER BY tablename;

-- 2. Проверяем ENUM типы
SELECT 
  'ENUM типы созданы' as check_type,
  typname as enum_name
FROM pg_type 
WHERE typname IN ('bonus_transaction_type', 'referral_status', 'promo_discount_type');

-- 3. Проверяем триггеры
SELECT 
  'Триггеры созданы' as check_type,
  tgname as trigger_name,
  relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE tgname IN ('on_profile_created_create_bonus', 'user_bonuses_updated_at', 'promo_codes_updated_at');

-- 4. Проверяем бонусные счета (должны быть созданы для всех существующих пользователей)
SELECT 
  'Бонусные счета' as check_type,
  COUNT(*) as count,
  SUM(balance) as total_balance
FROM user_bonuses;

-- 5. Проверяем реферальные коды
SELECT 
  'Реферальные коды' as check_type,
  COUNT(*) as count
FROM referral_codes;

-- Если все 5 запросов вернули результаты - миграция прошла успешно! ✅


