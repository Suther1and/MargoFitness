-- ============================================
-- ИНСТРУКЦИЯ ДЛЯ ПОЛЬЗОВАТЕЛЯ
-- ============================================
-- Этот SQL можно выполнить в Supabase Dashboard -> SQL Editor
-- чтобы проверить и исправить icon_url для кастомных достижений
-- ============================================

-- Шаг 1: Проверяем текущее состояние
SELECT 
  id,
  title,
  icon,
  icon_url,
  category,
  sort_order,
  created_at
FROM achievements
WHERE title IN ('Первый шаг', 'Первая отметка', 'Постоянство')
ORDER BY sort_order;

-- Если icon_url = NULL для этих достижений, выполните следующие UPDATE:

-- Шаг 2: Обновляем icon_url
UPDATE achievements 
SET icon_url = '/achievements/first-step.png' 
WHERE title = 'Первый шаг';

UPDATE achievements 
SET icon_url = '/achievements/first-mark.png' 
WHERE title = 'Первая отметка';

UPDATE achievements 
SET icon_url = '/achievements/consistency.png' 
WHERE title = 'Постоянство';

-- Шаг 3: Проверяем результат
SELECT 
  id,
  title,
  icon_url,
  CASE 
    WHEN icon_url IS NULL THEN '❌ NULL'
    ELSE '✅ ' || icon_url
  END as status
FROM achievements
WHERE title IN ('Первый шаг', 'Первая отметка', 'Постоянство')
ORDER BY sort_order;
