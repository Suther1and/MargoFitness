-- ============================================
-- Миграция 022 - Часть 1: Структура
-- ============================================

-- 1. ENUMS
CREATE TYPE achievement_category AS ENUM (
  'streaks',
  'metrics',
  'habits',
  'weight',
  'consistency',
  'workouts'
);

-- Добавляем новый тип транзакции для достижений
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'achievement' 
    AND enumtypid = 'bonus_transaction_type'::regtype
  ) THEN
    ALTER TYPE bonus_transaction_type ADD VALUE 'achievement';
  END IF;
END $$;

-- 2. Таблица achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category achievement_category NOT NULL,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  reward_amount INTEGER CHECK (reward_amount IS NULL OR reward_amount > 0),
  icon TEXT NOT NULL,
  color_class TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_sort_order ON achievements(sort_order);
CREATE INDEX IF NOT EXISTS idx_achievements_is_secret ON achievements(is_secret);

-- 3. Таблица user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_unlocked ON user_achievements(user_id, unlocked_at DESC);

-- 4. RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view all achievements"
  ON achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Admins can view all user achievements"
  ON user_achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

