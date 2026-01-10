-- =========================================================================
-- Миграция: Добавление полей для умной системы целей питания
-- =========================================================================
-- Дата создания: 2026-01-10
-- Описание: Добавляет поддержку типа цели питания (похудение/баланс/набор)
--           и уровня активности пользователя для расчета калорий
-- =========================================================================

-- Эта миграция не требует изменения структуры таблиц, так как:
-- 1. diary_settings.widget_goals уже имеет тип JSONB
-- 2. diary_entries.metrics уже имеет тип JSONB  
-- 3. diary_settings.user_params уже имеет тип JSONB

-- Обновляем комментарии для документации новых полей

COMMENT ON COLUMN public.diary_settings.widget_goals IS 
'JSONB containing widget goals and nutrition goal type. 
Example structure:
{
  "water": { "goal": 2000 },
  "steps": { "goal": 10000 },
  "nutrition": {
    "goal": 2200,
    "goalType": "maintain"
  }
}
Where goalType can be: "loss" (похудение), "maintain" (баланс), "gain" (набор)';

COMMENT ON COLUMN public.diary_settings.user_params IS 
'JSONB containing user parameters for calculations.
Example structure:
{
  "height": 170,
  "weight": 65,
  "age": 28,
  "gender": "female",
  "activityLevel": 1.55
}
Where activityLevel can be: 1.375 (низкая), 1.55 (средняя), 1.725 (высокая)';

COMMENT ON COLUMN public.diary_entries.metrics IS 
'JSONB containing daily metrics including nutrition goal type for tracking goal changes.
Example structure:
{
  "calories": 1850,
  "nutritionGoalType": "maintain",
  "water": 1500,
  "steps": 8000,
  "weight": 65.5,
  "sleep": 7.5,
  "caffeine": 2,
  "mood": 4,
  "energy": 7,
  "foodQuality": 4
}
The nutritionGoalType field tracks which goal type was active when calories were logged,
allowing proper validation of daily goals in statistics and tracking goal changes over time.';

-- =========================================================================
-- Структура данных для использования в приложении
-- =========================================================================

-- В diary_settings.widget_goals для nutrition виджета сохраняется:
-- {
--   "goal": 2200,              -- Текущая цель по калориям (число)
--   "goalType": "maintain"     -- Тип цели: 'loss' | 'maintain' | 'gain'
-- }

-- В diary_settings.user_params сохраняется:
-- {
--   "height": 170,           -- Рост в см
--   "weight": 65,            -- Вес в кг  
--   "age": 28,               -- Возраст в годах
--   "gender": "female",      -- Пол: 'male' | 'female'
--   "activityLevel": 1.55    -- Уровень активности: 1.375 | 1.55 | 1.725
-- }

-- В diary_entries.metrics для каждого дня сохраняется:
-- {
--   "calories": 1850,                -- Калории за день
--   "nutritionGoalType": "maintain", -- Тип цели в этот конкретный день
--   ...остальные метрики...
-- }

-- =========================================================================
-- Информация для команды статистики
-- =========================================================================

-- После применения этой миграции в diary_entries.metrics будут доступны:
-- - nutritionGoalType: 'loss' | 'maintain' | 'gain' - тип цели в конкретный день
-- 
-- В diary_settings.widget_goals для nutrition виджета:
-- - goalType: 'loss' | 'maintain' | 'gain' - текущий тип цели пользователя
-- 
-- В diary_settings.user_params:
-- - activityLevel: number (1.375 | 1.55 | 1.725) - уровень активности

-- Это позволит в статистике:
-- 1. Правильно валидировать достижение целей с учетом типа (loss/maintain/gain)
-- 2. Отслеживать изменения целей пользователя во времени
-- 3. Показывать корректные метрики успешности в зависимости от выбранной цели
