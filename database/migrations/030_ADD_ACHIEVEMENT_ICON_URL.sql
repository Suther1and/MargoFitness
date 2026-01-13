-- ============================================
-- Миграция 030: Добавление icon_url для кастомных иконок достижений
-- ============================================

-- Добавляем поле icon_url для хранения пути к PNG иконкам
ALTER TABLE achievements 
ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Комментарий
COMMENT ON COLUMN achievements.icon_url IS 'Путь к PNG иконке (например: /achievements/first-step.png). Если NULL - используется emoji из поля icon';

-- Обновляем существующие достижения с кастомными иконками
UPDATE achievements 
SET icon_url = '/achievements/first-step.png' 
WHERE title = 'Первый шаг';

UPDATE achievements 
SET icon_url = '/achievements/first-mark.png' 
WHERE title = 'Первая отметка';

UPDATE achievements 
SET icon_url = '/achievements/consistency.png' 
WHERE title = 'Постоянство';
