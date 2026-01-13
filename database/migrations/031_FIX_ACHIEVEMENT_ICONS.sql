-- ============================================
-- Миграция 031: Исправление icon_url для достижений
-- ============================================
-- Эта миграция гарантирует, что icon_url установлен правильно
-- для трёх кастомных достижений, независимо от предыдущих миграций
-- ============================================

-- Сначала проверим и удалим дубликаты, если они есть
WITH duplicates AS (
  SELECT id, title, 
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM achievements
  WHERE title IN ('Первый шаг', 'Первая отметка', 'Постоянство')
)
DELETE FROM achievements
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Теперь обновляем icon_url для нужных достижений
UPDATE achievements 
SET icon_url = '/achievements/first-step.png' 
WHERE title = 'Первый шаг' AND (icon_url IS NULL OR icon_url != '/achievements/first-step.png');

UPDATE achievements 
SET icon_url = '/achievements/first-mark.png' 
WHERE title = 'Первая отметка' AND (icon_url IS NULL OR icon_url != '/achievements/first-mark.png');

UPDATE achievements 
SET icon_url = '/achievements/consistency.png' 
WHERE title = 'Постоянство' AND (icon_url IS NULL OR icon_url != '/achievements/consistency.png');

-- Выводим результат для проверки
DO $$
DECLARE
  first_step_count INT;
  first_mark_count INT;
  consistency_count INT;
BEGIN
  SELECT COUNT(*) INTO first_step_count FROM achievements WHERE title = 'Первый шаг' AND icon_url = '/achievements/first-step.png';
  SELECT COUNT(*) INTO first_mark_count FROM achievements WHERE title = 'Первая отметка' AND icon_url = '/achievements/first-mark.png';
  SELECT COUNT(*) INTO consistency_count FROM achievements WHERE title = 'Постоянство' AND icon_url = '/achievements/consistency.png';
  
  RAISE NOTICE 'Обновлено достижений:';
  RAISE NOTICE '  Первый шаг: %', first_step_count;
  RAISE NOTICE '  Первая отметка: %', first_mark_count;
  RAISE NOTICE '  Постоянство: %', consistency_count;
END $$;
