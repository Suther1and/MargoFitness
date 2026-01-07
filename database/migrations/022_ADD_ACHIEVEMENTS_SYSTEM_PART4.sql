-- ============================================
-- Миграция 022 - Часть 4: Достижения (2/2)
-- ============================================

-- ВЕС
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Первая отметка', 'Записать вес первый раз', 'weight', false, NULL, '⚖️', 'text-gray-500', 30, '{"type": "weight_recorded", "value": 1}'),
('Контроль', 'Записывать вес 7 дней подряд', 'weight', false, 50, '📊', 'text-blue-500', 31, '{"type": "weight_streak", "value": 7}'),
('Месяц контроля', 'Записывать вес 30 дней подряд', 'weight', false, 100, '📈', 'text-green-500', 32, '{"type": "weight_streak", "value": 30}'),
('Цель достигнута!', 'Достичь целевого веса', 'weight', false, 300, '🎯', 'text-amber-500', 33, '{"type": "weight_goal_reached"}'),
('Стабильность', 'Поддерживать целевой вес 14 дней', 'weight', true, 200, '🏅', 'text-purple-500', 34, '{"type": "weight_maintain", "value": 14}');

-- РЕГУЛЯРНОСТЬ
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Постоянство', 'Использовать трекер 15 дней в месяц', 'consistency', false, 100, '📅', 'text-blue-500', 40, '{"type": "monthly_entries", "value": 15}'),
('Идеальный месяц', 'Использовать трекер все 30 дней месяца', 'consistency', true, 400, '🌟', 'text-yellow-500', 41, '{"type": "monthly_entries", "value": 30}'),
('Ветеран', 'Использовать трекер 100 дней всего', 'consistency', false, 150, '🎖️', 'text-orange-500', 42, '{"type": "total_entries", "value": 100}'),
('Легенда', 'Использовать трекер 365 дней всего', 'consistency', true, 500, '🏛️', 'text-purple-500', 43, '{"type": "total_entries", "value": 365}');

-- ТРЕНИРОВКИ
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Первая тренировка', 'Завершить первую тренировку', 'workouts', false, NULL, '🏋️', 'text-red-500', 50, '{"type": "workouts_completed", "value": 1}'),
('Недельный цикл', 'Завершить 7 тренировок', 'workouts', false, 75, '💪', 'text-orange-500', 51, '{"type": "workouts_completed", "value": 7}'),
('Атлет', 'Завершить 30 тренировок', 'workouts', false, 150, '🥇', 'text-yellow-500', 52, '{"type": "workouts_completed", "value": 30}'),
('Мастер спорта', 'Завершить 100 тренировок', 'workouts', true, 300, '🏆', 'text-purple-500', 53, '{"type": "workouts_completed", "value": 100}');

-- СПЕЦИАЛЬНЫЕ
INSERT INTO achievements (title, description, category, is_secret, reward_amount, icon, color_class, sort_order, metadata) VALUES
('Ночная сова', 'Записать сон меньше 4 часов', 'metrics', true, NULL, '🦉', 'text-indigo-500', 60, '{"type": "sleep_low", "value": 4}'),
('Идеальный день', 'Выполнить все цели за день', 'consistency', true, 150, '✨', 'text-amber-500', 61, '{"type": "perfect_day"}'),
('Перфекционист', 'Выполнить все цели 7 дней подряд', 'consistency', true, 250, '🎯', 'text-purple-500', 62, '{"type": "perfect_streak", "value": 7}'),
('Гидратор', 'Достичь цели по воде 30 дней подряд', 'metrics', true, 200, '💦', 'text-cyan-500', 63, '{"type": "water_goal_streak", "value": 30}'),
('Энергетик', 'Записать уровень энергии 5/5 десять раз', 'metrics', false, 50, '⚡', 'text-yellow-500', 64, '{"type": "energy_max", "value": 10}'),
('Радость жизни', 'Записать отличное настроение 14 дней подряд', 'metrics', true, 150, '😊', 'text-pink-500', 65, '{"type": "mood_great_streak", "value": 14}');

