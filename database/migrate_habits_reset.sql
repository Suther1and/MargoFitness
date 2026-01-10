-- Миграция: Сброс данных привычек для новой системы расписания
-- Дата: 2026-01-10
-- Описание: Обнуляем habits_completed в diary_entries для чистого старта
-- с новой системой дней недели вместо frequency

-- 1. КРИТИЧНО: Сначала делаем бэкап существующих данных (опционально)
-- Если нужно сохранить старые данные привычек, раскомментируйте:
-- CREATE TABLE IF NOT EXISTS diary_entries_habits_backup AS
-- SELECT user_id, date, habits_completed 
-- FROM diary_entries
-- WHERE habits_completed IS NOT NULL 
--   AND habits_completed != '{}'::jsonb;

-- 2. Обнуляем все habits_completed записи
UPDATE diary_entries 
SET habits_completed = '{}'::jsonb 
WHERE habits_completed IS NOT NULL;

-- 3. Обновляем структуру habits в diary_settings
-- ВАЖНО: Этот скрипт работает только если у пользователя уже есть привычки
-- Он добавляет поле daysOfWeek со значением по умолчанию (все дни)

-- Для каждой привычки добавляем daysOfWeek: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
-- и удаляем старое поле frequency и streak

UPDATE diary_settings
SET habits = (
  SELECT jsonb_agg(
    habit - 'frequency' - 'streak' || jsonb_build_object(
      'daysOfWeek', '["mon", "tue", "wed", "thu", "fri", "sat", "sun"]'::jsonb
    )
  )
  FROM jsonb_array_elements(habits) AS habit
)
WHERE habits IS NOT NULL 
  AND habits != '[]'::jsonb
  AND jsonb_array_length(habits) > 0;

-- 4. Проверка результата (выполнить отдельно после миграции)
-- SELECT user_id, habits 
-- FROM diary_settings 
-- WHERE habits IS NOT NULL 
-- LIMIT 5;

-- 5. Инвалидация кеша (выполняется автоматически при следующем запросе)
-- Не требует дополнительных действий

-- КОММЕНТАРИЙ:
-- После выполнения этого скрипта все привычки будут сброшены,
-- и пользователь начнет с чистого листа с новой системой расписания.
-- Старые значения frequency будут заменены на daysOfWeek со всеми днями.
-- Streak будет удалено, т.к. теперь рассчитывается динамически.
