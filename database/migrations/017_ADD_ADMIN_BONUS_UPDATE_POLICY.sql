-- ============================================
-- Миграция 017: Добавление политики UPDATE для админов в user_bonuses
-- ============================================

-- Добавляем политику UPDATE для админов
CREATE POLICY "Admins can update all bonus accounts"
  ON user_bonuses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

COMMENT ON POLICY "Admins can update all bonus accounts" ON user_bonuses IS 
  'Админы могут редактировать бонусные счета всех пользователей';

