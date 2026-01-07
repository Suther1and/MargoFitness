-- ============================================
-- Миграция 022: Система достижений
-- ============================================
-- Добавляет:
-- - Систему достижений для трекера здоровья
-- - Интеграцию с бонусной системой
-- - Категории и награды
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================

-- Категории достижений
CREATE TYPE achievement_category AS ENUM (
  'streaks',      -- Серии (дни подряд)
  'metrics',      -- Метрики (вода, шаги и т.д.)
  'habits',       -- Привычки
  'weight',       -- Вес и цели
  'consistency',  -- Регулярность использования
  'workouts'      -- Тренировки (будущее)
);

-- Добавляем новый тип транзакции для достижений
ALTER TYPE bonus_transaction_type ADD VALUE IF NOT EXISTS 'achievement';

-- ============================================
-- 2. Таблица: achievements (справочник)
-- ============================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category achievement_category NOT NULL,
  
  -- Секретность и награды
  is_secret BOOLEAN NOT NULL DEFAULT false,
  reward_amount INTEGER CHECK (reward_amount IS NULL OR reward_amount > 0),
  
  -- Визуализация
  icon TEXT NOT NULL,  -- Эмодзи или название иконки
  color_class TEXT NOT NULL,  -- CSS класс для цвета
  
  -- Условия проверки (гибкая структура)
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Порядок отображения
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Метка времени
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_sort_order ON achievements(sort_order);
CREATE INDEX IF NOT EXISTS idx_achievements_is_secret ON achievements(is_secret);

-- Комментарии
COMMENT ON TABLE achievements IS 'Справочник всех достижений в системе';
COMMENT ON COLUMN achievements.is_secret IS 'Скрытое достижение (показывается с заглушкой до получения)';
COMMENT ON COLUMN achievements.reward_amount IS 'Количество шагов в награду (NULL = без награды)';
COMMENT ON COLUMN achievements.metadata IS 'JSONB с условиями: {type: "streak_days", value: 7} и т.д.';

-- ============================================
-- 3. Таблица: user_achievements (полученные)
-- ============================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Связи
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Дата получения
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Уникальность: одно достижение один раз
  UNIQUE(user_id, achievement_id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_unlocked ON user_achievements(user_id, unlocked_at DESC);

-- Комментарии
COMMENT ON TABLE user_achievements IS 'Полученные достижения пользователей';
COMMENT ON COLUMN user_achievements.unlocked_at IS 'Дата и время получения достижения';

-- ============================================
-- 4. RLS Политики
-- ============================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- achievements: все пользователи видят все достижения (для списка)
CREATE POLICY "Anyone can view all achievements"
  ON achievements FOR SELECT
  USING (true);

-- user_achievements: пользователи видят только свои полученные достижения
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- user_achievements: только система может создавать записи (через service role)
-- Это предотвращает читерство
CREATE POLICY "Service role can insert achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (false);  -- Блокируем для обычных пользователей

-- Админы могут видеть все достижения пользователей
CREATE POLICY "Admins can view all user achievements"
  ON user_achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 5. Функция для безопасной разблокировки
-- ============================================

CREATE OR REPLACE FUNCTION unlock_achievement_for_user(
  p_user_id UUID,
  p_achievement_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already_unlocked BOOLEAN;
  v_reward_amount INTEGER;
BEGIN
  -- Проверяем, не получено ли уже это достижение
  SELECT EXISTS (
    SELECT 1 FROM user_achievements
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id
  ) INTO v_already_unlocked;
  
  IF v_already_unlocked THEN
    RETURN FALSE;
  END IF;
  
  -- Создаем запись о получении достижения
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (p_user_id, p_achievement_id);
  
  -- Получаем награду
  SELECT reward_amount INTO v_reward_amount
  FROM achievements
  WHERE id = p_achievement_id;
  
  -- Если есть награда, создаем бонусную транзакцию
  IF v_reward_amount IS NOT NULL AND v_reward_amount > 0 THEN
    INSERT INTO bonus_transactions (user_id, amount, type, description, metadata)
    SELECT 
      p_user_id,
      v_reward_amount,
      'achievement'::bonus_transaction_type,
      'За достижение: ' || title,
      jsonb_build_object('achievement_id', p_achievement_id)
    FROM achievements
    WHERE id = p_achievement_id;
    
    -- Обновляем баланс
    UPDATE user_bonuses
    SET balance = balance + v_reward_amount
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION unlock_achievement_for_user IS 'Безопасная разблокировка достижения с автоматическим начислением награды';

-- ============================================
-- 6. Заполнение базовыми достижениями
-- ============================================

-- СЕРИИ (Streaks)
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Первый шаг', 'Заполнить дневник здоровья 1 день', 'streaks', false, NULL, '👣', 'text-green-500', 1, '{"type": "streak_days", "value": 1}'),
('Неделя силы', 'Заполнять дневник 7 дней подряд', 'streaks', false, 50, '🔥', 'text-orange-500', 2, '{"type": "streak_days", "value": 7}'),
('Две недели', 'Заполнять дневник 14 дней подряд', 'streaks', false, 100, '💪', 'text-red-500', 3, '{"type": "streak_days", "value": 14}'),
('Месяц дисциплины', 'Заполнять дневник 30 дней подряд', 'streaks', false, 200, '🏆', 'text-yellow-500', 4, '{"type": "streak_days", "value": 30}'),
('Железная воля', 'Заполнять дневник 100 дней подряд', 'streaks', true, 500, '💎', 'text-purple-500', 5, '{"type": "streak_days", "value": 100}');

-- МЕТРИКИ (Metrics)
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Водохлёб', 'Выпить 2.5л воды за день', 'metrics', false, NULL, '💧', 'text-blue-500', 10, '{"type": "water_daily", "value": 2500}'),
('Океан', 'Выпить 100л воды всего', 'metrics', false, 50, '🌊', 'text-cyan-500', 11, '{"type": "water_total", "value": 100000}'),
('Марафонец', 'Пройти 10000 шагов за день', 'metrics', false, NULL, '🏃', 'text-green-500', 12, '{"type": "steps_daily", "value": 10000}'),
('Ультрамарафон', 'Пройти 25000 шагов за день', 'metrics', true, 100, '🚀', 'text-orange-500', 13, '{"type": "steps_daily", "value": 25000}'),
('Гигашаги', 'Пройти 1000000 шагов всего', 'metrics', false, 150, '👟', 'text-amber-500', 14, '{"type": "steps_total", "value": 1000000}'),
('Сонный король', 'Спать 8+ часов за ночь', 'metrics', false, NULL, '😴', 'text-indigo-500', 15, '{"type": "sleep_daily", "value": 8}'),
('Неделя сна', 'Спать 8+ часов 7 дней подряд', 'metrics', false, 75, '🌙', 'text-purple-500', 16, '{"type": "sleep_streak", "value": 7}');

-- ПРИВЫЧКИ (Habits)
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Начало пути', 'Выполнить любую привычку', 'habits', false, NULL, '✨', 'text-yellow-500', 20, '{"type": "habit_complete_any", "value": 1}'),
('Привычный режим', 'Выполнить все привычки 5 дней подряд', 'habits', false, 75, '⭐', 'text-amber-500', 21, '{"type": "habits_all_streak", "value": 5}'),
('Хозяин своей жизни', 'Выполнить все привычки 30 дней подряд', 'habits', true, 250, '👑', 'text-yellow-400', 22, '{"type": "habits_all_streak", "value": 30}'),
('Коллекционер', 'Создать 10 привычек', 'habits', false, 50, '📚', 'text-blue-500', 23, '{"type": "habits_created", "value": 10}'),
('Стопроцентник', 'Выполнить привычку 100 раз', 'habits', false, 100, '💯', 'text-green-500', 24, '{"type": "habit_completions", "value": 100}');

-- ВЕС (Weight)
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Первая отметка', 'Записать вес первый раз', 'weight', false, NULL, '⚖️', 'text-gray-500', 30, '{"type": "weight_recorded", "value": 1}'),
('Контроль', 'Записывать вес 7 дней подряд', 'weight', false, 50, '📊', 'text-blue-500', 31, '{"type": "weight_streak", "value": 7}'),
('Месяц контроля', 'Записывать вес 30 дней подряд', 'weight', false, 100, '📈', 'text-green-500', 32, '{"type": "weight_streak", "value": 30}'),
('Цель достигнута!', 'Достичь целевого веса', 'weight', false, 300, '🎯', 'text-amber-500', 33, '{"type": "weight_goal_reached"}'),
('Стабильность', 'Поддерживать целевой вес 14 дней', 'weight', true, 200, '🏅', 'text-purple-500', 34, '{"type": "weight_maintain", "value": 14}');

-- РЕГУЛЯРНОСТЬ (Consistency)
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Постоянство', 'Использовать трекер 15 дней в месяц', 'consistency', false, 100, '📅', 'text-blue-500', 40, '{"type": "monthly_entries", "value": 15}'),
('Идеальный месяц', 'Использовать трекер все 30 дней месяца', 'consistency', true, 400, '🌟', 'text-yellow-500', 41, '{"type": "monthly_entries", "value": 30}'),
('Ветеран', 'Использовать трекер 100 дней всего', 'consistency', false, 150, '🎖️', 'text-orange-500', 42, '{"type": "total_entries", "value": 100}'),
('Легенда', 'Использовать трекер 365 дней всего', 'consistency', true, 500, '🏛️', 'text-purple-500', 43, '{"type": "total_entries", "value": 365}');

-- ТРЕНИРОВКИ (Workouts - будущее)
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Первая тренировка', 'Завершить первую тренировку', 'workouts', false, NULL, '🏋️', 'text-red-500', 50, '{"type": "workouts_completed", "value": 1}'),
('Недельный цикл', 'Завершить 7 тренировок', 'workouts', false, 75, '💪', 'text-orange-500', 51, '{"type": "workouts_completed", "value": 7}'),
('Атлет', 'Завершить 30 тренировок', 'workouts', false, 150, '🥇', 'text-yellow-500', 52, '{"type": "workouts_completed", "value": 30}'),
('Мастер спорта', 'Завершить 100 тренировок', 'workouts', true, 300, '🏆', 'text-purple-500', 53, '{"type": "workouts_completed", "value": 100}');

-- СПЕЦИАЛЬНЫЕ/СЕКРЕТНЫЕ
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Ночная сова', 'Записать сон меньше 4 часов', 'metrics', true, NULL, '🦉', 'text-indigo-500', 60, '{"type": "sleep_low", "value": 4}'),
('Идеальный день', 'Выполнить все цели за день', 'consistency', true, 150, '✨', 'text-amber-500', 61, '{"type": "perfect_day"}'),
('Перфекционист', 'Выполнить все цели 7 дней подряд', 'consistency', true, 250, '🎯', 'text-purple-500', 62, '{"type": "perfect_streak", "value": 7}'),
('Гидратор', 'Достичь цели по воде 30 дней подряд', 'metrics', true, 200, '💦', 'text-cyan-500', 63, '{"type": "water_goal_streak", "value": 30}'),
('Энергетик', 'Записать уровень энергии 5/5 десять раз', 'metrics', false, 50, '⚡', 'text-yellow-500', 64, '{"type": "energy_max", "value": 10}'),
('Радость жизни', 'Записать отличное настроение 14 дней подряд', 'metrics', true, 150, '😊', 'text-pink-500', 65, '{"type": "mood_great_streak", "value": 14}');

-- ============================================
-- Готово!
-- ============================================

