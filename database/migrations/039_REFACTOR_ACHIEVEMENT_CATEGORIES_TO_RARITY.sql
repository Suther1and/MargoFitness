-- Миграция для перевода категорий достижений на систему редкости
-- ВАЖНО: Если вы получаете ошибку "unsafe use of new value common", 
-- выполните сначала блок ALTER TYPE (строки 8-12) ОТДЕЛЬНО, а затем всё остальное.

-- 1. Добавляем новые значения в ENUM (выполнить отдельно, если будет ошибка 55P04)
ALTER TYPE achievement_category ADD VALUE IF NOT EXISTS 'common';
ALTER TYPE achievement_category ADD VALUE IF NOT EXISTS 'rare';
ALTER TYPE achievement_category ADD VALUE IF NOT EXISTS 'epic';
ALTER TYPE achievement_category ADD VALUE IF NOT EXISTS 'legendary';
ALTER TYPE achievement_category ADD VALUE IF NOT EXISTS 'absolute';

-- 2. Обновляем достижения: Обычные (Common)
-- Используем NULL вместо 0, так как в базе стоит ограничение CHECK (reward_amount > 0)
UPDATE achievements SET category = 'common', reward_amount = NULL WHERE title IN ('Палитра привычек', 'Первый шаг', 'Водохлёб', 'Марафонец', 'Сонный король', 'Начало пути', 'Первая отметка');
UPDATE achievements SET category = 'common', reward_amount = 50 WHERE title IN ('Паспорт здоровья', 'Первая тренировка');
UPDATE achievements SET category = 'common', reward_amount = 250 WHERE title = 'Теплый прием';

-- 3. Обновляем достижения: Редкие (Rare)
UPDATE achievements SET category = 'rare', reward_amount = NULL WHERE title = 'Цель достигнута!';
UPDATE achievements SET category = 'rare', reward_amount = 500 WHERE title = 'Наставник';
UPDATE achievements SET category = 'rare', reward_amount = 50 WHERE title IN ('Неделя силы', 'Океан', 'Новичок');
UPDATE achievements SET category = 'rare', reward_amount = 100 WHERE title = 'Две недели';
UPDATE achievements SET category = 'rare', reward_amount = 250 WHERE title = 'В команде';
UPDATE achievements SET category = 'rare' WHERE title IN ('Неделя сна', 'Энергетик', 'Привычный режим', 'Контроль', 'Постоянство', 'Недельный цикл', 'Уверенный старт');

-- 4. Обновляем достижения: Эпические (Epic)
UPDATE achievements SET category = 'epic', reward_amount = 750 WHERE title = 'Ментор';
UPDATE achievements SET category = 'epic', reward_amount = NULL WHERE title = 'Ночная сова';
UPDATE achievements SET category = 'epic', reward_amount = 250 WHERE title = 'Перфекционист';
UPDATE achievements SET category = 'epic', reward_amount = 150 WHERE title IN ('Радость жизни', 'Месяц дисциплины', 'Любитель');
UPDATE achievements SET category = 'epic', reward_amount = 250 WHERE title = 'Атлет';
UPDATE achievements SET category = 'epic' WHERE title IN ('Гигашаги', 'Стопроцентник', 'Месяц контроля', 'Ветеран', 'Продвинутый клуб');

-- 5. Обновляем достижения: Легендарные (Legendary)
UPDATE achievements SET category = 'legendary', reward_amount = 300 WHERE title = 'Мастер';
UPDATE achievements SET category = 'legendary', reward_amount = 1000 WHERE title = 'Гуру';
UPDATE achievements SET category = 'legendary', reward_amount = 500 WHERE title = 'Железная воля';
UPDATE achievements SET category = 'legendary', reward_amount = 250 WHERE title = 'Хозяин своей жизни';
UPDATE achievements SET category = 'legendary', reward_amount = 400 WHERE title = 'Идеальный месяц';
UPDATE achievements SET category = 'legendary', reward_amount = 300 WHERE title = 'Мастер спорта';
UPDATE achievements SET category = 'legendary', reward_amount = 200 WHERE title = 'Гидратор';
UPDATE achievements SET category = 'legendary' WHERE title IN ('Ультрамарафон', 'Стабильность', 'Идеальный день');

-- 6. Обновляем достижения: Абсолютные (Absolute)
UPDATE achievements SET category = 'absolute', reward_amount = 1000 WHERE title IN ('Легенда', 'Коллекционер', 'Высшая лига', 'Игра в долгую');

-- 7. Обновляем sort_order для группировки по редкости
UPDATE achievements SET sort_order = 
  CASE 
    WHEN category = 'common' THEN 100 + (sort_order % 100)
    WHEN category = 'rare' THEN 200 + (sort_order % 100)
    WHEN category = 'epic' THEN 300 + (sort_order % 100)
    WHEN category = 'legendary' THEN 400 + (sort_order % 100)
    WHEN category = 'absolute' THEN 500 + (sort_order % 100)
    ELSE 900 + sort_order
  END;
