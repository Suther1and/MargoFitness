-- ============================================
-- ENUM OPTIMIZATION FOR SUPABASE UI
-- ============================================
-- Преобразование text полей в ENUM для dropdown в Supabase Table Editor
-- 
-- ВАЖНО: Выполняйте этот скрипт ТОЛЬКО если у вас НЕТ пользователей в БД
-- или вы готовы к миграции данных!
-- ============================================

-- ============================================
-- ШАГ 1: Создание ENUM типов
-- ============================================

-- ENUM для роли пользователя
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- ENUM для статуса подписки  
CREATE TYPE subscription_status_enum AS ENUM ('active', 'inactive', 'canceled');

-- Примечание: subscription_tier уже ENUM, его не трогаем


-- ============================================
-- ШАГ 2: Удаление RLS политик, зависящих от role
-- ============================================

-- Временно удаляем политики, которые проверяют role
DROP POLICY IF EXISTS "Admins full access content_weeks" ON content_weeks;
DROP POLICY IF EXISTS "Admins full access workout_sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Admins full access exercises" ON exercises;
DROP POLICY IF EXISTS "Admins have full access to free content" ON free_content;


-- ============================================
-- ШАГ 3: Миграция колонки role
-- ============================================

-- Добавляем временную колонку с ENUM типом
ALTER TABLE profiles 
ADD COLUMN role_new user_role;

-- Копируем данные из старой колонки в новую с приведением типа
UPDATE profiles 
SET role_new = role::user_role;

-- Удаляем старую колонку (теперь можно, т.к. политики удалены)
ALTER TABLE profiles 
DROP COLUMN role;

-- Переименовываем новую колонку в role
ALTER TABLE profiles 
RENAME COLUMN role_new TO role;

-- Устанавливаем значение по умолчанию и NOT NULL
ALTER TABLE profiles 
ALTER COLUMN role SET DEFAULT 'user'::user_role,
ALTER COLUMN role SET NOT NULL;


-- ============================================
-- ШАГ 4: Миграция колонки subscription_status
-- ============================================

-- Добавляем временную колонку
ALTER TABLE profiles 
ADD COLUMN subscription_status_new subscription_status_enum;

-- Копируем данные
UPDATE profiles 
SET subscription_status_new = subscription_status::subscription_status_enum;

-- Удаляем старую колонку
ALTER TABLE profiles 
DROP COLUMN subscription_status;

-- Переименовываем
ALTER TABLE profiles 
RENAME COLUMN subscription_status_new TO subscription_status;

-- Устанавливаем значения по умолчанию
ALTER TABLE profiles 
ALTER COLUMN subscription_status SET DEFAULT 'inactive'::subscription_status_enum,
ALTER COLUMN subscription_status SET NOT NULL;


-- ============================================
-- ШАГ 5: Пересоздание RLS политик с новым типом
-- ============================================

-- Пересоздаем политики для админов на content_weeks
CREATE POLICY "Admins full access content_weeks"
  ON content_weeks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

-- Пересоздаем политики для workout_sessions
CREATE POLICY "Admins full access workout_sessions"
  ON workout_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

-- Пересоздаем политики для exercises
CREATE POLICY "Admins full access exercises"
  ON exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

-- Пересоздаем политики для free_content
CREATE POLICY "Admins have full access to free content"
  ON free_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );


-- ============================================
-- ШАГ 6: Добавляем комментарии к столбцам
-- ============================================

-- Комментарии помогают Supabase Table Editor показывать подсказки

COMMENT ON COLUMN profiles.role IS 
  'User role: user (regular user) or admin (administrator with full access)';

COMMENT ON COLUMN profiles.subscription_status IS 
  'Subscription status: active (paid and valid), inactive (not paid), canceled (user cancelled)';

COMMENT ON COLUMN profiles.subscription_tier IS 
  'Subscription tier: free (no access to paid workouts), basic (2 workouts/week), pro (3 workouts/week), elite (all workouts + bonuses)';

COMMENT ON COLUMN profiles.subscription_expires_at IS 
  'Date when subscription expires. NULL = no expiration (for free tier)';

COMMENT ON COLUMN profiles.email IS 
  'User email address from auth.users';

COMMENT ON COLUMN profiles.payment_method_info IS 
  'JSON with payment method details (card last 4 digits, etc.)';

COMMENT ON COLUMN profiles.stats IS 
  'JSON with user statistics: workouts_completed, current_streak, last_workout_at, etc.';


-- Комментарии для других таблиц
COMMENT ON COLUMN products.type IS 
  'Product type: subscription_tier (monthly subscription) or one_time_pack (single purchase)';

COMMENT ON COLUMN products.tier_level IS 
  'Tier level for subscriptions: 1=Basic, 2=Pro, 3=Elite. NULL for one-time packs';

COMMENT ON COLUMN content_weeks.is_published IS 
  'Whether this week is published and visible to users';

COMMENT ON COLUMN workout_sessions.required_tier IS 
  'Minimum subscription tier required to access this workout';

COMMENT ON COLUMN workout_sessions.session_number IS 
  'Workout number in the week: 1, 2, or 3';

COMMENT ON COLUMN exercises.video_kinescope_id IS 
  'Kinescope video ID for this exercise';

COMMENT ON COLUMN user_workout_completions.rating IS 
  'Overall workout rating: 1 (bad) to 5 (excellent)';

COMMENT ON COLUMN user_workout_completions.difficulty_rating IS 
  'Workout difficulty: 1 (very easy) to 5 (very hard)';

COMMENT ON COLUMN free_content.is_published IS 
  'Whether this content is published and visible to authenticated users';

COMMENT ON COLUMN free_content.order_index IS 
  'Display order (lower numbers appear first)';


-- ============================================
-- ШАГ 7: Обновление триггера для автосоздания профиля
-- ============================================

-- Обновляем функцию handle_new_user() для использования новых ENUM типов
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, subscription_status, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'loki2723@mail.ru' THEN 'admin'::user_role ELSE 'user'::user_role END,
    'inactive'::subscription_status_enum,
    'free'::subscription_tier
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- После выполнения этого скрипта:
-- 1. В Supabase Table Editor для profiles.role появится dropdown (user | admin)
-- 2. Для profiles.subscription_status появится dropdown (active | inactive | canceled)
-- 3. Для profiles.subscription_tier уже есть dropdown (free | basic | pro | elite)
-- 4. При наведении на столбцы будут видны подсказки из комментариев
-- 
-- Протестируйте:
-- - Откройте Table Editor → profiles
-- - Попробуйте изменить role - должен быть dropdown
-- - Попробуйте изменить subscription_status - должен быть dropdown
-- ============================================

SELECT 'ENUM_OPTIMIZATION COMPLETE - Check Supabase Table Editor!' AS status;

