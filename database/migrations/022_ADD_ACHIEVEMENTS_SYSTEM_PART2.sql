-- ============================================
-- Миграция 022 - Часть 2: RPC функция
-- ============================================

CREATE OR REPLACE FUNCTION unlock_achievement_for_user(
  p_user_id UUID,
  p_achievement_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already_unlocked BOOLEAN;
  v_reward_amount INTEGER;
BEGIN
  -- Проверяем, не получено ли уже это достижение
  SELECT EXISTS (
    SELECT 1 FROM user_achievements
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id
  ) INTO v_already_unlocked;
  
  IF v_already_unlocked THEN
    RETURN FALSE;
  END IF;
  
  -- Создаем запись о получении достижения
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (p_user_id, p_achievement_id);
  
  -- Получаем награду
  SELECT reward_amount INTO v_reward_amount
  FROM achievements
  WHERE id = p_achievement_id;
  
  -- Если есть награда, создаем бонусную транзакцию
  IF v_reward_amount IS NOT NULL AND v_reward_amount > 0 THEN
    INSERT INTO bonus_transactions (user_id, amount, type, description, metadata)
    SELECT 
      p_user_id,
      v_reward_amount,
      'achievement'::bonus_transaction_type,
      'За достижение: ' || title,
      jsonb_build_object('achievement_id', p_achievement_id)
    FROM achievements
    WHERE id = p_achievement_id;
    
    -- Обновляем баланс
    UPDATE user_bonuses
    SET balance = balance + v_reward_amount
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

