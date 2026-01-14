-- RPC для получения агрегированных метрик пользователя
CREATE OR REPLACE FUNCTION get_user_metrics_stats(p_user_id UUID)
RETURNS TABLE (
  total_water BIGINT,
  total_steps BIGINT,
  energy_max_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM((metrics->>'waterIntake')::numeric), 0)::BIGINT as total_water,
    COALESCE(SUM((metrics->>'steps')::numeric), 0)::BIGINT as total_steps,
    COUNT(*) FILTER (WHERE (metrics->>'energyLevel')::numeric = 5)::BIGINT as energy_max_count
  FROM diary_entries
  WHERE user_id = p_user_id;
END;
$$;

COMMENT ON FUNCTION get_user_metrics_stats IS 'Получает суммарную статистику по воде, шагам и количеству дней с макс. энергией';
