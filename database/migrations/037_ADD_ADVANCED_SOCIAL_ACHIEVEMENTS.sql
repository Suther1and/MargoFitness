-- Миграция для продвинутых реферальных и длительных достижений

-- 1. Обновляем существующего Наставника (за 1 друга), чтобы явно указать значение 1 в метаданных
UPDATE achievements 
SET metadata = '{"type": "referral_mentor", "value": 1}'
WHERE title = 'Наставник';

-- 2. Ментор (3 друга)
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Ментор',
  '3 ваших друга сделали первую покупку по вашему приглашению',
  'social',
  false,
  750,
  '🧙‍♂️',
  'text-indigo-400',
  72,
  '{"type": "referral_mentor", "value": 3}',
  '/achievements/referral-3.png'
);

-- 3. Гуру (5 друзей)
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Гуру',
  '5 ваших друзей сделали первую покупку по вашему приглашению',
  'social',
  false,
  1000,
  '🧘',
  'text-purple-400',
  73,
  '{"type": "referral_mentor", "value": 5}',
  '/achievements/referral-5.png'
);

-- 4. Игра в долгую (12 месяцев)
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Игра в долгую',
  'Купите любую подписку на 12 месяцев',
  'social',
  false,
  1000,
  '⏳',
  'text-emerald-500',
  95,
  '{"type": "subscription_duration", "value": 12}',
  '/achievements/sub-12m.png'
);
