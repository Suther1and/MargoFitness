-- Миграция 014: Исправление таблиц бонусной системы
-- Применяется после 013_ADD_BONUS_REFERRAL_SYSTEM

-- 1. Исправляем таблицу user_bonuses
DO $$ 
BEGIN
  -- Убираем старые поля если они есть
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_bonuses' AND column_name = 'total_earned') THEN
    ALTER TABLE user_bonuses DROP COLUMN total_earned;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_bonuses' AND column_name = 'total_spent') THEN
    ALTER TABLE user_bonuses DROP COLUMN total_spent;
  END IF;
  
  -- Переименовываем lifetime_spent в total_spent_for_cashback
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_bonuses' AND column_name = 'lifetime_spent') THEN
    ALTER TABLE user_bonuses RENAME COLUMN lifetime_spent TO total_spent_for_cashback;
  END IF;
  
  -- Если total_spent_for_cashback еще не существует, создаем
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_bonuses' AND column_name = 'total_spent_for_cashback') THEN
    ALTER TABLE user_bonuses ADD COLUMN total_spent_for_cashback NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_spent_for_cashback >= 0);
  END IF;
END $$;

-- 2. Исправляем таблицу referrals
DO $$
BEGIN
  -- Убираем referral_code из referrals (он хранится в отдельной таблице referral_codes)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'referral_code') THEN
    ALTER TABLE referrals DROP COLUMN referral_code;
  END IF;
  
  -- Убираем first_purchase_bonus_given (логика основана на status)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'first_purchase_bonus_given') THEN
    ALTER TABLE referrals DROP COLUMN first_purchase_bonus_given;
  END IF;
END $$;

-- 3. Обновляем комментарии
COMMENT ON COLUMN user_bonuses.total_spent_for_cashback IS 'Фактически оплачено за все время (для расчета уровня кешбека)';

-- Успех!
DO $$
BEGIN
  RAISE NOTICE '✅ Миграция 014 успешно завершена!';
END $$;

