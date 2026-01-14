-- Миграция для превращения бонусов в систему достижений
-- ВАЖНО: Если вы получаете ошибку "unsafe use of new value social", 
-- выполните сначала строку №5 отдельно, а затем весь остальной файл.

ALTER TYPE achievement_category ADD VALUE IF NOT EXISTS 'social';

-- 2. Обновляем функцию создания бонусного аккаунта (удаляем автоматический бонус)
DROP FUNCTION IF EXISTS create_bonus_account_for_user(uuid);

CREATE OR REPLACE FUNCTION create_bonus_account_for_user(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_code TEXT;
  v_bonus_account_id UUID;
BEGIN
  -- Генерируем уникальный реферальный код
  v_referral_code := substring(md5(random()::text || p_user_id::text) from 1 for 8);
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = v_referral_code) LOOP
    v_referral_code := substring(md5(random()::text || clock_timestamp()::text) from 1 for 8);
  END LOOP;

  -- Создаем бонусный счет (баланс 0, так как теперь это достижение)
  INSERT INTO user_bonuses (user_id, balance)
  VALUES (p_user_id, 0)
  RETURNING id INTO v_bonus_account_id;

  -- Создаем реферальный код
  INSERT INTO referral_codes (user_id, code)
  VALUES (p_user_id, v_referral_code);

  RETURN v_bonus_account_id;
END;
$$;

-- 3. Добавляем новые достижения
-- Теплый прием
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Теплый прием',
  'Получите подарок за регистрацию в нашем клубе',
  'social',
  false,
  250,
  '🎁',
  'text-rose-500',
  0,
  '{"type": "registration", "value": 250}',
  '/achievements/welcome-bonus.png'
);

-- В команде
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'В команде',
  'За регистрацию по приглашению или использование первого промокода',
  'social',
  false,
  250,
  '🤝',
  'text-sky-500',
  70,
  '{"type": "referral_joined", "value": 250}',
  '/achievements/referral-join.png'
);

-- Наставник
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Наставник',
  'Ваш друг сделал первую покупку по вашему приглашению',
  'social',
  false,
  500,
  '🏆',
  'text-amber-500',
  71,
  '{"type": "referral_mentor", "value": 500}',
  '/achievements/referral-mentor.png'
);

-- Мета-достижения: Новичок
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Новичок',
  'Соберите 5 любых достижений',
  'consistency',
  false,
  50,
  '🥉',
  'text-orange-400',
  80,
  '{"type": "achievement_count", "value": 5}',
  '/achievements/achievement-5.png'
);

-- Мета-достижения: Любитель
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Любитель',
  'Соберите 15 любых достижений',
  'consistency',
  false,
  150,
  '🥈',
  'text-slate-300',
  81,
  '{"type": "achievement_count", "value": 15}',
  '/achievements/achievement-15.png'
);

-- Мета-достижения: Мастер
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Мастер',
  'Соберите 30 любых достижений',
  'consistency',
  false,
  300,
  '🥇',
  'text-yellow-400',
  82,
  '{"type": "achievement_count", "value": 30}',
  '/achievements/achievement-30.png'
);

-- Мета-достижения: Коллекционер
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Коллекционер',
  'Соберите все доступные достижения в приложении',
  'consistency',
  true,
  1000,
  '👑',
  'text-purple-600',
  100,
  '{"type": "achievement_count", "value": 0}',
  '/achievements/collector.png'
);
