-- =====================================================
-- Migration 010: Telegram Authentication Support
-- =====================================================
-- Описание: Добавляет поддержку авторизации через Telegram
-- Дата: 24 декабря 2025
-- Автор: AI Assistant
-- =====================================================

-- Создаем таблицу для хранения одноразовых кодов обмена
CREATE TABLE IF NOT EXISTS auth_exchange_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_auth_exchange_codes_code ON auth_exchange_codes(code);
CREATE INDEX idx_auth_exchange_codes_user_id ON auth_exchange_codes(user_id);
CREATE INDEX idx_auth_exchange_codes_expires_at ON auth_exchange_codes(expires_at);

-- Добавляем поля для Telegram в таблицу profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS telegram_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Индекс для telegram_id
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id);

-- RLS политики для auth_exchange_codes
ALTER TABLE auth_exchange_codes ENABLE ROW LEVEL SECURITY;

-- Только authenticated пользователи могут читать свои коды
CREATE POLICY "Users can read own exchange codes"
  ON auth_exchange_codes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Только service_role может создавать/обновлять коды
-- (политики по умолчанию запрещают все, кроме service_role)

-- Функция для автоматической очистки истекших кодов
CREATE OR REPLACE FUNCTION cleanup_expired_exchange_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth_exchange_codes
  WHERE expires_at < NOW() OR used = true;
END;
$$;

-- Комментарии
COMMENT ON TABLE auth_exchange_codes IS 'Временные коды для обмена на сессию при Telegram авторизации';
COMMENT ON COLUMN auth_exchange_codes.code IS 'Одноразовый код обмена';
COMMENT ON COLUMN auth_exchange_codes.user_id IS 'ID пользователя для создания сессии';
COMMENT ON COLUMN auth_exchange_codes.expires_at IS 'Время истечения кода (5 минут)';
COMMENT ON COLUMN auth_exchange_codes.used IS 'Флаг использования кода';

COMMENT ON COLUMN profiles.telegram_id IS 'Telegram ID пользователя';
COMMENT ON COLUMN profiles.telegram_username IS 'Telegram username пользователя';

-- =====================================================
-- Конец миграции 010
-- =====================================================

