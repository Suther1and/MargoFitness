-- ============================================
-- Миграция 022 - Часть 3: Достижения (1/2)
-- ============================================

-- СЕРИИ
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Первый шаг', 'Заполнить дневник здоровья 1 день', 'streaks', false, NULL, '👣', 'text-green-500', 1, '{"type": "streak_days", "value": 1}'),
('Неделя силы', 'Заполнять дневник 7 дней подряд', 'streaks', false, 50, '🔥', 'text-orange-500', 2, '{"type": "streak_days", "value": 7}'),
('Две недели', 'Заполнять дневник 14 дней подряд', 'streaks', false, 100, '💪', 'text-red-500', 3, '{"type": "streak_days", "value": 14}'),
('Месяц дисциплины', 'Заполнять дневник 30 дней подряд', 'streaks', false, 200, '🏆', 'text-yellow-500', 4, '{"type": "streak_days", "value": 30}'),
('Железная воля', 'Заполнять дневник 100 дней подряд', 'streaks', true, 500, '💎', 'text-purple-500', 5, '{"type": "streak_days", "value": 100}');

-- МЕТРИКИ
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Водохлёб', 'Выпить 2.5л воды за день', 'metrics', false, NULL, '💧', 'text-blue-500', 10, '{"type": "water_daily", "value": 2500}'),
('Океан', 'Выпить 100л воды всего', 'metrics', false, 50, '🌊', 'text-cyan-500', 11, '{"type": "water_total", "value": 100000}'),
('Марафонец', 'Пройти 10000 шагов за день', 'metrics', false, NULL, '🏃', 'text-green-500', 12, '{"type": "steps_daily", "value": 10000}'),
('Ультрамарафон', 'Пройти 25000 шагов за день', 'metrics', true, 100, '🚀', 'text-orange-500', 13, '{"type": "steps_daily", "value": 25000}'),
('Гигашаги', 'Пройти 1000000 шагов всего', 'metrics', false, 150, '👟', 'text-amber-500', 14, '{"type": "steps_total", "value": 1000000}'),
('Сонный король', 'Спать 8+ часов за ночь', 'metrics', false, NULL, '😴', 'text-indigo-500', 15, '{"type": "sleep_daily", "value": 8}'),
('Неделя сна', 'Спать 8+ часов 7 дней подряд', 'metrics', false, 75, '🌙', 'text-purple-500', 16, '{"type": "sleep_streak", "value": 7}');

-- ПРИВЫЧКИ
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Начало пути', 'Выполнить любую привычку', 'habits', false, NULL, '✨', 'text-yellow-500', 20, '{"type": "habit_complete_any", "value": 1}'),
('Привычный режим', 'Выполнить все привычки 5 дней подряд', 'habits', false, 75, '⭐', 'text-amber-500', 21, '{"type": "habits_all_streak", "value": 5}'),
('Хозяин своей жизни', 'Выполнить все привычки 30 дней подряд', 'habits', true, 250, '👑', 'text-yellow-400', 22, '{"type": "habits_all_streak", "value": 30}'),
('Коллекционер', 'Создать 10 привычек', 'habits', false, 50, '📚', 'text-blue-500', 23, '{"type": "habits_created", "value": 10}'),
('Стопроцентник', 'Выполнить привычку 100 раз', 'habits', false, 100, '💯', 'text-green-500', 24, '{"type": "habit_completions", "value": 100}');

