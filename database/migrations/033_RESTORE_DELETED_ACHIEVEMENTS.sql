-- Миграция для восстановления 3 ранее удаленных достижений с обновленными условиями
-- 1. Стабильность (теперь это тренд на снижение веса)
-- 2. Идеальный день (выполнение всех целей)
-- 3. Перфекционист (серия идеальных дней)

-- 1. Стабильность
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url) 
SELECT 
  'Стабильность', 
  '7 раз подряд записать вес, который меньше или равен предыдущему', 
  'weight', 
  true, 
  200, 
  '🏅', 
  'text-purple-500', 
  34, 
  '{"type": "weight_down_streak", "value": 7}',
  '/achievements/stability.png'
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Стабильность');

-- 2. Идеальный день
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url) 
SELECT 
  'Идеальный день', 
  'Выполнить все цели за день (шаги, вода, привычки)', 
  'consistency', 
  true, 
  150, 
  '✨', 
  'text-amber-500', 
  61, 
  '{"type": "perfect_day"}',
  '/achievements/perfect-day.png'
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Идеальный день');

-- 3. Перфекционист
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata, icon_url) 
SELECT 
  'Перфекционист', 
  'Выполнять "Идеальный день" 7 дней подряд', 
  'consistency', 
  true, 
  250, 
  '🎯', 
  'text-purple-500', 
  62, 
  '{"type": "perfect_streak", "value": 7}',
  '/achievements/perfectionist.png'
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE title = 'Перфекционист');
