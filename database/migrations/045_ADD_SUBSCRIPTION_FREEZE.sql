-- ============================================
-- Миграция: Добавление функционала заморозки подписки
-- ============================================

-- Шаг 1: Новые поля в profiles для заморозки
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS freeze_tokens_total integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS freeze_tokens_used integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS freeze_days_total integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS freeze_days_used integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS is_frozen boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS frozen_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS frozen_until timestamp with time zone;

-- Индекс для быстрого поиска замороженных подписок
CREATE INDEX IF NOT EXISTS profiles_frozen_idx ON profiles(is_frozen) WHERE is_frozen = true;

-- Шаг 2: Таблица истории заморозок
CREATE TABLE IF NOT EXISTS subscription_freezes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  days_used integer NOT NULL DEFAULT 0,
  reason text CHECK (reason IN ('manual_unfreeze', 'days_exhausted', 'admin')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscription_freezes_user_idx ON subscription_freezes(user_id);
CREATE INDEX IF NOT EXISTS subscription_freezes_active_idx ON subscription_freezes(user_id) WHERE ended_at IS NULL;

-- Шаг 3: RLS для subscription_freezes
ALTER TABLE subscription_freezes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own freezes"
  ON subscription_freezes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to freezes"
  ON subscription_freezes FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Админы могут читать все заморозки
CREATE POLICY "Admins can view all freezes"
  ON subscription_freezes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
