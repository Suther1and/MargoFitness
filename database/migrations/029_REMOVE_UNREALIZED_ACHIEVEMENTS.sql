-- Migration: Remove unrealized achievements
-- Description: Remove achievements that require complex logic not implemented
-- Date: 2026-01-11

-- Удаляем достижения, которые не реализованы и не будут реализованы

-- 1. Удаляем "Стабильность" (weight_maintain)
DELETE FROM achievements 
WHERE metadata->>'type' = 'weight_maintain';

-- 2. Удаляем "Идеальный день" (perfect_day)
DELETE FROM achievements 
WHERE metadata->>'type' = 'perfect_day';

-- 3. Удаляем "Перфекционист" (perfect_streak)
DELETE FROM achievements 
WHERE metadata->>'type' = 'perfect_streak';

-- Также удаляем user_achievements для этих достижений (если есть)
-- Это обеспечит целостность данных
DELETE FROM user_achievements 
WHERE achievement_id IN (
  SELECT id FROM achievements 
  WHERE metadata->>'type' IN ('weight_maintain', 'perfect_day', 'perfect_streak')
);

-- Проверка результата
SELECT 
  title, 
  description, 
  metadata->>'type' as type,
  category
FROM achievements 
WHERE metadata->>'type' IN ('weight_maintain', 'perfect_day', 'perfect_streak');
-- Должен вернуть 0 строк

-- Итоговый подсчет достижений по категориям
SELECT 
  category,
  COUNT(*) as total
FROM achievements
GROUP BY category
ORDER BY category;
