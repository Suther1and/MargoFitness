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

-- 3. Исправляем функцию создания бонусного аккаунта
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
  
  -- Обновляем баланс (без total_earned/total_spent)
  UPDATE user_bonuses
  SET balance = 250
  WHERE id = v_bonus_account_id;
  
  RAISE NOTICE 'Бонусный аккаунт создан для пользователя %', p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Обновляем комментарии
COMMENT ON COLUMN user_bonuses.total_spent_for_cashback IS 'Фактически оплачено за все время (для расчета уровня кешбека)';

-- Успех!
DO $$
BEGIN
  RAISE NOTICE '✅ Миграция 014 успешно завершена!';
END $$;

