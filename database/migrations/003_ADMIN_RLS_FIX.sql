-- ============================================
-- FIX: RLS политики для администраторов
-- ============================================

-- Удалить старые политики (если есть)
DROP POLICY IF EXISTS "Admins full access content_weeks" ON content_weeks;
DROP POLICY IF EXISTS "Admins full access workout_sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Admins full access exercises" ON exercises;

-- CONTENT_WEEKS - Админы могут всё
CREATE POLICY "Admins full access content_weeks"
  ON content_weeks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- WORKOUT_SESSIONS - Админы могут всё
CREATE POLICY "Admins full access workout_sessions"
  ON workout_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- EXERCISES - Админы могут всё
CREATE POLICY "Admins full access exercises"
  ON exercises FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Теперь админы могут создавать/редактировать/удалять:
-- - Недели контента
-- - Тренировки
-- - Упражнения
-- ============================================

