-- ============================================
-- Миграция 013: Бонусная и реферальная системы
-- ============================================
-- Добавляет:
-- - Бонусную валюту "Шаги" 👟
-- - Многоуровневый кешбек (3-10%)
-- - Реферальную программу
-- - Промокоды
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================

CREATE TYPE bonus_transaction_type AS ENUM (
  'welcome',           -- Приветственный бонус
  'cashback',          -- Кешбек с покупки
  'referral_bonus',    -- Процент с покупки реферала
  'referral_first',    -- Разовый бонус за первого реферала
  'spent',             -- Списание при оплате
  'admin_adjustment'   -- Ручная корректировка админом
);

CREATE TYPE referral_status AS ENUM (
  'registered',              -- Просто зарегистрировался
  'first_purchase_made'      -- Совершил первую покупку
);

CREATE TYPE promo_discount_type AS ENUM (
  'percent',        -- Процентная скидка
  'fixed_amount'    -- Фиксированная сумма
);

-- ============================================
-- 2. Таблица: user_bonuses (бонусные счета)
-- ============================================

CREATE TABLE IF NOT EXISTS user_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Баланс шагов
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  
  -- Уровень кешбека (1=Bronze 3%, 2=Silver 5%, 3=Gold 7%, 4=Platinum 10%)
  cashback_level INTEGER NOT NULL DEFAULT 1 CHECK (cashback_level BETWEEN 1 AND 4),
  lifetime_spent NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (lifetime_spent >= 0),
  
  -- Уровень реферальной программы (1=3%, 2=5%, 3=7%, 4=10%)
  referral_level INTEGER NOT NULL DEFAULT 1 CHECK (referral_level BETWEEN 1 AND 4),
  total_referral_earnings NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_referral_earnings >= 0),
  
  -- Метки времени
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_user_bonuses_user_id ON user_bonuses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bonuses_cashback_level ON user_bonuses(cashback_level);
CREATE INDEX IF NOT EXISTS idx_user_bonuses_referral_level ON user_bonuses(referral_level);

-- Комментарии
COMMENT ON TABLE user_bonuses IS 'Бонусные счета пользователей с уровнями кешбека и реферальной программы';
COMMENT ON COLUMN user_bonuses.balance IS 'Текущий баланс шагов';
COMMENT ON COLUMN user_bonuses.lifetime_spent IS 'Фактически оплачено за все время (для расчета уровня кешбека)';
COMMENT ON COLUMN user_bonuses.total_referral_earnings IS 'Сумма покупок всех рефералов (для уровня реф. программы)';

-- ============================================
-- 3. Таблица: bonus_transactions (история)
-- ============================================

CREATE TABLE IF NOT EXISTS bonus_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Сумма (положительная = начисление, отрицательная = списание)
  amount INTEGER NOT NULL CHECK (amount != 0),
  
  -- Тип операции
  type bonus_transaction_type NOT NULL,
  description TEXT NOT NULL,
  
  -- Связанные сущности (опционально)
  related_payment_id TEXT,  -- ID платежа из payment_transactions
  related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- Для реферальных
  
  -- Метаданные
  metadata JSONB DEFAULT '{}',
  
  -- Метка времени
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_user_id ON bonus_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_type ON bonus_transactions(type);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_created ON bonus_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bonus_transactions_user_created ON bonus_transactions(user_id, created_at DESC);

-- Комментарии
COMMENT ON TABLE bonus_transactions IS 'История всех бонусных операций';
COMMENT ON COLUMN bonus_transactions.amount IS 'Количество шагов (+начисление, -списание)';

-- ============================================
-- 4. Таблица: referral_codes (уникальные коды)
-- ============================================

CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);

-- Комментарии
COMMENT ON TABLE referral_codes IS 'Уникальные реферальные коды пользователей';

-- ============================================
-- 5. Таблица: referrals (связи)
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Кто пригласил → кого пригласил
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Через какой код
  referral_code TEXT NOT NULL,
  
  -- Статус
  status referral_status NOT NULL DEFAULT 'registered',
  first_purchase_bonus_given BOOLEAN NOT NULL DEFAULT false,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_purchase_at TIMESTAMP WITH TIME ZONE
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Комментарии
COMMENT ON TABLE referrals IS 'Связи между приглашающими и приглашенными пользователями';
COMMENT ON COLUMN referrals.first_purchase_bonus_given IS 'Выдан ли разовый бонус 500 шагов за первого реферала';

-- ============================================
-- 6. Таблица: promo_codes (промокоды)
-- ============================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Код промокода (NEWYEAR2025)
  code TEXT NOT NULL UNIQUE,
  
  -- Тип и значение скидки
  discount_type promo_discount_type NOT NULL,
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  
  -- К каким продуктам применимо (null = ко всем)
  applicable_products JSONB,  -- ["product_id_1", "product_id_2"] или null
  
  -- Ограничения
  usage_limit INTEGER,  -- null = без ограничений
  usage_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Статус
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Кто создал
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Метки времени
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_expires_at ON promo_codes(expires_at);

-- Комментарии
COMMENT ON TABLE promo_codes IS 'Промокоды для скидок (создаются админами)';
COMMENT ON COLUMN promo_codes.applicable_products IS 'JSON массив ID продуктов или null для применения ко всем';

-- ============================================
-- 7. RLS Политики
-- ============================================

ALTER TABLE user_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- user_bonuses: пользователи видят только свой счет
CREATE POLICY "Users can view own bonus account"
  ON user_bonuses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bonus accounts"
  ON user_bonuses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- bonus_transactions: пользователи видят только свои операции
CREATE POLICY "Users can view own transactions"
  ON bonus_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON bonus_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- referral_codes: все могут читать (для валидации кода)
CREATE POLICY "Anyone can read referral codes"
  ON referral_codes FOR SELECT
  USING (true);

-- referrals: пользователи видят где они участвуют
CREATE POLICY "Users can view their referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- promo_codes: все могут читать активные
CREATE POLICY "Anyone can read active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can read all promo codes"
  ON promo_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create promo codes"
  ON promo_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update promo codes"
  ON promo_codes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 8. Функции
-- ============================================

-- Функция: Создать бонусный счет и начислить приветственный бонус
CREATE OR REPLACE FUNCTION create_bonus_account_for_user(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_referral_code TEXT;
  v_bonus_account_id UUID;
BEGIN
  -- Генерируем уникальный реферальный код (8 символов)
  v_referral_code := substring(md5(random()::text || p_user_id::text) from 1 for 8);
  
  -- Проверяем уникальность кода
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = v_referral_code) LOOP
    v_referral_code := substring(md5(random()::text || clock_timestamp()::text) from 1 for 8);
  END LOOP;
  
  -- Создаем бонусный счет
  INSERT INTO user_bonuses (user_id)
  VALUES (p_user_id)
  RETURNING id INTO v_bonus_account_id;
  
  -- Создаем реферальный код
  INSERT INTO referral_codes (user_id, code)
  VALUES (p_user_id, v_referral_code);
  
  -- Начисляем приветственный бонус 250 шагов
  INSERT INTO bonus_transactions (user_id, amount, type, description)
  VALUES (p_user_id, 250, 'welcome', 'Приветственный бонус');
  
  -- Обновляем баланс
  UPDATE user_bonuses
  SET balance = 250, total_earned = 250
  WHERE id = v_bonus_account_id;
  
  RAISE NOTICE 'Created bonus account for user % with code % and 250 welcome bonus', p_user_id, v_referral_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция: Автообновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
CREATE TRIGGER user_bonuses_updated_at
  BEFORE UPDATE ON user_bonuses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Создание бонусных счетов для существующих пользователей
-- ============================================

DO $$
DECLARE
  v_user RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_user IN SELECT id FROM profiles WHERE id NOT IN (SELECT user_id FROM user_bonuses)
  LOOP
    PERFORM create_bonus_account_for_user(v_user.id);
    v_count := v_count + 1;
  END LOOP;
  
  IF v_count > 0 THEN
    RAISE NOTICE 'Created bonus accounts for % existing users', v_count;
  ELSE
    RAISE NOTICE 'No existing users without bonus accounts';
  END IF;
END $$;

-- ============================================
-- 10. Триггер: Создание бонусного счета при регистрации
-- ============================================

CREATE OR REPLACE FUNCTION trigger_create_bonus_account()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_bonus_account_for_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_create_bonus
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_bonus_account();

-- ============================================
-- ЗАВЕРШЕНИЕ МИГРАЦИИ
-- ============================================

DO $$
DECLARE
  v_user_bonuses_count INTEGER;
  v_referral_codes_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_user_bonuses_count FROM user_bonuses;
  SELECT COUNT(*) INTO v_referral_codes_count FROM referral_codes;
  
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ Миграция 013 успешно завершена!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Создано:';
  RAISE NOTICE '  • 5 новых таблиц с RLS';
  RAISE NOTICE '  • 3 новых ENUM типа';
  RAISE NOTICE '  • Триггеры и функции';
  RAISE NOTICE '  • Бонусных счетов: %', v_user_bonuses_count;
  RAISE NOTICE '  • Реферальных кодов: %', v_referral_codes_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Готово к использованию! 👟';
  RAISE NOTICE '================================================';
END $$;

