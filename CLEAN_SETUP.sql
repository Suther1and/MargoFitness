-- ============================================
-- MARGOFITNESS CLEAN SETUP
-- Полная настройка БД с нуля
-- Версия: 2.0
-- ============================================

-- ============================================
-- ШАГ 1: Создать типы и функции
-- ============================================

-- ENUM для уровней подписки
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro', 'elite');

-- Функция для автообновления updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- ШАГ 2: Создать таблицы
-- ============================================

-- PROFILES (профили пользователей)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  role text DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
  subscription_status text DEFAULT 'inactive' NOT NULL CHECK (subscription_status IN ('active', 'inactive', 'canceled')),
  subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
  subscription_expires_at timestamp with time zone,
  payment_method_info jsonb,
  stats jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_subscription_idx ON profiles(subscription_status, subscription_expires_at);

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();


-- PRODUCTS (продукты: подписки и паки)
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('subscription_tier', 'one_time_pack')),
  name text NOT NULL,
  description text,
  price integer NOT NULL CHECK (price >= 0),
  tier_level integer CHECK (tier_level BETWEEN 1 AND 3),
  is_active boolean DEFAULT true NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT tier_level_required_for_subscriptions 
    CHECK (type != 'subscription_tier' OR tier_level IS NOT NULL)
);

CREATE INDEX products_type_idx ON products(type, is_active);

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();


-- USER_PURCHASES (покупки)
CREATE TABLE user_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  payment_provider text,
  payment_id text,
  amount integer NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  UNIQUE(user_id, product_id)
);

CREATE INDEX user_purchases_user_idx ON user_purchases(user_id);
CREATE INDEX user_purchases_product_idx ON user_purchases(product_id);


-- CONTENT_WEEKS (недели контента)
CREATE TABLE content_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date date NOT NULL,
  end_date date NOT NULL,
  title text,
  description text,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  EXCLUDE USING gist (daterange(start_date, end_date, '[)') WITH &&)
);

CREATE INDEX idx_content_weeks_dates ON content_weeks (start_date, end_date);
CREATE INDEX idx_content_weeks_published ON content_weeks (is_published, start_date);

CREATE TRIGGER set_updated_at_content_weeks
  BEFORE UPDATE ON content_weeks
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();


-- WORKOUT_SESSIONS (тренировки в неделе)
CREATE TABLE workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid REFERENCES content_weeks(id) ON DELETE CASCADE NOT NULL,
  session_number integer NOT NULL CHECK (session_number BETWEEN 1 AND 3),
  required_tier subscription_tier NOT NULL DEFAULT 'basic',
  title text NOT NULL,
  description text,
  cover_image_url text,
  estimated_duration integer,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  UNIQUE(week_id, session_number)
);

CREATE INDEX idx_workout_sessions_week ON workout_sessions(week_id, session_number);

CREATE TRIGGER set_updated_at_workout_sessions
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();


-- EXERCISES (упражнения в тренировке)
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  order_index integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  video_kinescope_id text NOT NULL,
  video_thumbnail_url text,
  sets integer,
  reps text,
  rest_seconds integer,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_exercises_session ON exercises(workout_session_id, order_index);


-- USER_WORKOUT_COMPLETIONS (завершенные тренировки)
CREATE TABLE user_workout_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workout_session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamp with time zone DEFAULT now() NOT NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  difficulty_rating integer CHECK (difficulty_rating BETWEEN 1 AND 5),
  
  UNIQUE(user_id, workout_session_id)
);

CREATE INDEX idx_completions_user ON user_workout_completions(user_id, completed_at DESC);
CREATE INDEX idx_completions_session ON user_workout_completions(workout_session_id);


-- ============================================
-- ШАГ 3: Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_completions ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- PRODUCTS
CREATE POLICY "Active products viewable by everyone"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

-- USER_PURCHASES
CREATE POLICY "Users view own purchases"
  ON user_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert purchases"
  ON user_purchases FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- CONTENT_WEEKS
CREATE POLICY "Published weeks viewable by authenticated"
  ON content_weeks FOR SELECT
  TO authenticated
  USING (is_published = true);

-- WORKOUT_SESSIONS
CREATE POLICY "Sessions in published weeks viewable"
  ON workout_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content_weeks
      WHERE content_weeks.id = workout_sessions.week_id
      AND content_weeks.is_published = true
    )
  );

-- EXERCISES
CREATE POLICY "Exercises viewable by authenticated"
  ON exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      JOIN content_weeks cw ON cw.id = ws.week_id
      WHERE ws.id = exercises.workout_session_id
      AND cw.is_published = true
    )
  );

-- USER_WORKOUT_COMPLETIONS
CREATE POLICY "Users view own completions"
  ON user_workout_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own completions"
  ON user_workout_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own completions"
  ON user_workout_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================
-- ШАГ 4: Триггер автосоздания профиля
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, subscription_status, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'loki2723@mail.ru' THEN 'admin' ELSE 'user' END,
    'inactive',
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ============================================
-- ШАГ 5: Тестовые данные
-- ============================================

-- ПРОДУКТЫ
INSERT INTO products (type, name, description, price, tier_level, is_active) VALUES
  ('subscription_tier', 'Basic', 'Доступ к базовым тренировкам (2 в неделю)', 990, 1, true),
  ('subscription_tier', 'Pro', 'Базовые + дополнительная тренировка (3 в неделю)', 1990, 2, true),
  ('subscription_tier', 'Elite', 'Полный доступ + персональные бонусы', 2990, 3, true),
  ('one_time_pack', '30 Days Abs Challenge', 'Интенсивная программа для пресса', 1490, NULL, true),
  ('one_time_pack', 'Ultimate Stretching Pack', 'Полный курс по растяжке', 990, NULL, true);


-- НЕДЕЛИ КОНТЕНТА
DO $$
DECLARE
  week1_id uuid;
  week2_id uuid;
  session_id uuid;
BEGIN
  -- Неделя 1 (текущая): 22.12-29.12
  INSERT INTO content_weeks (start_date, end_date, title, description, is_published)
  VALUES ('2025-12-22', '2025-12-29', 'Неделя 1: Сила и выносливость', 'Вводная неделя для адаптации', true)
  RETURNING id INTO week1_id;
  
  -- Неделя 2 (следующая): 29.12-05.01
  INSERT INTO content_weeks (start_date, end_date, title, description, is_published)
  VALUES ('2025-12-29', '2026-01-05', 'Неделя 2: Прогрессия', 'Увеличиваем интенсивность', false)
  RETURNING id INTO week2_id;
  
  -- === НЕДЕЛЯ 1: Тренировки ===
  
  -- Тренировка 1: Верх (Basic+)
  INSERT INTO workout_sessions (week_id, session_number, required_tier, title, description, estimated_duration)
  VALUES (week1_id, 1, 'basic', 'Верхняя часть тела', 'Грудь, спина и руки', 45)
  RETURNING id INTO session_id;
  
  INSERT INTO exercises (workout_session_id, order_index, title, description, video_kinescope_id, sets, reps, rest_seconds) VALUES
    (session_id, 1, 'Отжимания', 'Классические отжимания от пола. Держите спину прямой.', 'demo_pushups', 3, '12-15', 60),
    (session_id, 2, 'Жим гантелей', 'Лягте на скамью, опустите гантели до груди.', 'demo_press', 3, '10-12', 90),
    (session_id, 3, 'Тяга в наклоне', 'Тяните гантели к поясу, сводя лопатки.', 'demo_row', 3, '10-12', 90),
    (session_id, 4, 'Разводка', 'Разводите гантели в стороны, растягивая грудь.', 'demo_flyes', 3, '12-15', 60),
    (session_id, 5, 'Французский жим', 'Опускайте гантели за голову, работая локтями.', 'demo_french', 3, '12-15', 60);
  
  -- Тренировка 2: Низ (Basic+)
  INSERT INTO workout_sessions (week_id, session_number, required_tier, title, description, estimated_duration)
  VALUES (week1_id, 2, 'basic', 'Нижняя часть тела', 'Ноги и ягодицы', 45)
  RETURNING id INTO session_id;
  
  INSERT INTO exercises (workout_session_id, order_index, title, description, video_kinescope_id, sets, reps, rest_seconds) VALUES
    (session_id, 1, 'Приседания', 'Опускайтесь до параллели бедра с полом.', 'demo_squats', 4, '12-15', 90),
    (session_id, 2, 'Выпады', 'Шаг вперед, опускайтесь коленом к полу.', 'demo_lunges', 3, '10-12/ногу', 60),
    (session_id, 3, 'Мертвая тяга', 'Наклоняйтесь с прямой спиной.', 'demo_deadlift', 3, '10-12', 90),
    (session_id, 4, 'Подъемы на носки', 'Поднимайтесь на носки, напрягая икры.', 'demo_calf', 4, '15-20', 45),
    (session_id, 5, 'Ягодичный мост', 'Поднимайте таз вверх, напрягая ягодицы.', 'demo_bridge', 3, '15-20', 60);
  
  -- Тренировка 3: HIIT (Pro+)
  INSERT INTO workout_sessions (week_id, session_number, required_tier, title, description, estimated_duration)
  VALUES (week1_id, 3, 'pro', 'Функциональная тренировка', 'HIIT для жиросжигания', 40)
  RETURNING id INTO session_id;
  
  INSERT INTO exercises (workout_session_id, order_index, title, description, video_kinescope_id, sets, reps, rest_seconds) VALUES
    (session_id, 1, 'Бёрпи', 'Присед-планка-отжимание-прыжок. Максимум!', 'demo_burpees', 4, '10-15', 60),
    (session_id, 2, 'Скакалка', 'Прыгайте в быстром темпе.', 'demo_rope', 4, '1 минута', 30),
    (session_id, 3, 'Альпинист', 'Подтягивайте колени к груди поочередно.', 'demo_climber', 4, '20 секунд', 30),
    (session_id, 4, 'Планка', 'Держите тело прямо, напрягая кор.', 'demo_plank', 3, '45-60 сек', 60);
  
  -- === НЕДЕЛЯ 2: Тренировки (черновики) ===
  
  INSERT INTO workout_sessions (week_id, session_number, required_tier, title, description, estimated_duration)
  VALUES 
    (week2_id, 1, 'basic', 'Грудь и трицепс', 'Жимовые движения', 50),
    (week2_id, 2, 'basic', 'Спина и бицепс', 'Тяговые движения', 50),
    (week2_id, 3, 'pro', 'Ноги и плечи', 'Комплексная нагрузка', 55);

END $$;


-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Создано:
-- - 8 таблиц (profiles, products, purchases, weeks, sessions, exercises, completions)
-- - ENUM subscription_tier
-- - RLS политики
-- - Триггеры (автосоздание профиля, updated_at)
-- - Тестовые данные (5 продуктов, 2 недели, 6 тренировок, 14 упражнений)
-- 
-- Ваш email (loki2723@mail.ru) автоматически получит роль admin!
-- ============================================

