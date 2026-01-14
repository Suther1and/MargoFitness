-- Миграция для добавления достижений за профиль и подписки

-- 1. Паспорт здоровья
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Паспорт здоровья',
  'Заполните имя, телефон, почту, аватар и параметры здоровья в настройках',
  'social',
  false,
  150,
  '👤',
  'text-indigo-500',
  5,
  '{"type": "profile_complete", "value": 150}',
  '/achievements/profile-complete.png'
);

-- 2. Подписка: Уверенный старт
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Уверенный старт',
  'Станьте участником клуба с подпиской Basic',
  'social',
  false,
  100,
  '🥉',
  'text-amber-600',
  90,
  '{"type": "subscription_tier", "value": "basic"}',
  '/achievements/sub-basic.png'
);

-- 3. Подписка: Продвинутый клуб
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Продвинутый клуб',
  'Получите расширенный доступ с подпиской Pro',
  'social',
  false,
  200,
  '🥈',
  'text-slate-400',
  91,
  '{"type": "subscription_tier", "value": "pro"}',
  '/achievements/sub-pro.png'
);

-- 4. Подписка: Высшая лига
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url)
VALUES (
  'Высшая лига',
  'Максимальные возможности с подпиской Elite',
  'social',
  false,
  500,
  '💎',
  'text-purple-500',
  92,
  '{"type": "subscription_tier", "value": "elite"}',
  '/achievements/sub-elite.png'
);
