-- Миграция для добавления полей maxStreak и lastCompletedDate к привычкам
-- 
-- Эта миграция:
-- 1. Добавляет поля maxStreak и lastCompletedDate к существующим привычкам в JSON
-- 2. Устанавливает начальные значения для всех привычек
-- 3. Пересчитывает maxStreak из истории для каждого пользователя

-- ВАЖНО: Эта миграция безопасна и может быть запущена многократно
-- JSON поля diary_settings.habits уже существует, мы просто добавляем новые свойства

-- Функция для пересчета maxStreak из истории
CREATE OR REPLACE FUNCTION calculate_max_streak_for_habit(
  p_user_id UUID,
  p_habit_id TEXT,
  p_days_of_week TEXT[]
) RETURNS INTEGER AS $$
DECLARE
  v_max_streak INTEGER := 0;
  v_temp_streak INTEGER := 0;
  v_entry RECORD;
  v_day_of_week TEXT;
BEGIN
  -- Получаем все записи дневника для пользователя, отсортированные от старых к новым
  FOR v_entry IN 
    SELECT date, habits_completed 
    FROM health_diary 
    WHERE user_id = p_user_id 
      AND habits_completed IS NOT NULL
      AND habits_completed ? p_habit_id
    ORDER BY date ASC
  LOOP
    -- Определяем день недели (0=sun, 1=mon, ..., 6=sat)
    v_day_of_week := CASE EXTRACT(DOW FROM v_entry.date)
      WHEN 0 THEN 'sun'
      WHEN 1 THEN 'mon'
      WHEN 2 THEN 'tue'
      WHEN 3 THEN 'wed'
      WHEN 4 THEN 'thu'
      WHEN 5 THEN 'fri'
      WHEN 6 THEN 'sat'
    END;
    
    -- Проверяем, должна ли привычка показаться в этот день
    IF p_days_of_week IS NULL OR array_length(p_days_of_week, 1) = 0 OR v_day_of_week = ANY(p_days_of_week) THEN
      -- День запланирован - проверяем выполнение
      IF (v_entry.habits_completed->>p_habit_id)::boolean = true THEN
        -- Выполнено - увеличиваем streak
        v_temp_streak := v_temp_streak + 1;
        v_max_streak := GREATEST(v_max_streak, v_temp_streak);
      ELSE
        -- Не выполнено - сбрасываем streak
        v_temp_streak := 0;
      END IF;
    END IF;
    -- Если день не запланирован - пропускаем, не влияет на streak
  END LOOP;
  
  RETURN v_max_streak;
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления всех привычек пользователя
CREATE OR REPLACE FUNCTION update_habits_with_streak_fields()
RETURNS void AS $$
DECLARE
  v_user RECORD;
  v_habits JSONB;
  v_habit JSONB;
  v_updated_habits JSONB := '[]'::JSONB;
  v_max_streak INTEGER;
  v_days_of_week TEXT[];
BEGIN
  -- Проходим по всем пользователям у которых есть привычки
  FOR v_user IN 
    SELECT DISTINCT user_id, settings
    FROM diary_settings
    WHERE settings ? 'habits'
      AND settings->'habits' != 'null'
      AND jsonb_array_length(settings->'habits') > 0
  LOOP
    v_habits := v_user.settings->'habits';
    v_updated_habits := '[]'::JSONB;
    
    -- Обрабатываем каждую привычку
    FOR v_habit IN SELECT * FROM jsonb_array_elements(v_habits)
    LOOP
      -- Извлекаем daysOfWeek если есть
      IF v_habit ? 'daysOfWeek' AND v_habit->'daysOfWeek' != 'null' THEN
        v_days_of_week := ARRAY(SELECT jsonb_array_elements_text(v_habit->'daysOfWeek'));
      ELSE
        v_days_of_week := ARRAY['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      END IF;
      
      -- Рассчитываем maxStreak из истории
      v_max_streak := calculate_max_streak_for_habit(
        v_user.user_id,
        v_habit->>'id',
        v_days_of_week
      );
      
      -- Добавляем новые поля к привычке
      v_habit := v_habit || jsonb_build_object(
        'maxStreak', v_max_streak,
        'lastCompletedDate', null
      );
      
      -- Если daysOfWeek не существует, добавляем все дни
      IF NOT (v_habit ? 'daysOfWeek') THEN
        v_habit := v_habit || jsonb_build_object(
          'daysOfWeek', '["mon", "tue", "wed", "thu", "fri", "sat", "sun"]'::jsonb
        );
      END IF;
      
      v_updated_habits := v_updated_habits || jsonb_build_array(v_habit);
    END LOOP;
    
    -- Обновляем привычки пользователя
    UPDATE diary_settings
    SET settings = jsonb_set(settings, '{habits}', v_updated_habits)
    WHERE user_id = v_user.user_id;
    
    RAISE NOTICE 'Updated % habits for user %', jsonb_array_length(v_updated_habits), v_user.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Запускаем миграцию
SELECT update_habits_with_streak_fields();

-- Удаляем вспомогательные функции (опционально, можно оставить для повторного использования)
-- DROP FUNCTION IF EXISTS calculate_max_streak_for_habit(UUID, TEXT, TEXT[]);
-- DROP FUNCTION IF EXISTS update_habits_with_streak_fields();

-- Готово! Теперь все привычки имеют поля maxStreak и lastCompletedDate
