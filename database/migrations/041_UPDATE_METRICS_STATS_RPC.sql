-- RPC для получения статистических метрик пользователя (версия 3 - ОПТИМИЗИРОВАННАЯ)
-- Сначала удаляем старую версию
DROP FUNCTION IF EXISTS get_user_metrics_stats(UUID);

CREATE OR REPLACE FUNCTION get_user_metrics_stats(p_user_id UUID)
RETURNS TABLE (
  total_water BIGINT,
  total_steps BIGINT,
  energy_max_count BIGINT,
  total_habit_completions BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COALESCE(SUM((metrics->>'waterIntake')::numeric), 0)::BIGINT as water,
      COALESCE(SUM((metrics->>'steps')::numeric), 0)::BIGINT as steps,
      COUNT(*) FILTER (WHERE (metrics->>'energyLevel')::numeric >= 5)::BIGINT as energy
    FROM diary_entries
    WHERE user_id = p_user_id
  ),
  habits AS (
    -- Более быстрый способ подсчета всех 'true' в JSONB объектах habits_completed
    SELECT COUNT(*)::BIGINT as h_count
    FROM diary_entries,
         jsonb_each_text(COALESCE(habits_completed, '{}'::jsonb)) as hc
    WHERE user_id = p_user_id 
      AND hc.value = 'true'
  )
  SELECT 
    stats.water,
    stats.steps,
    stats.energy,
    habits.h_count
  FROM stats, habits;
END;
$$;
