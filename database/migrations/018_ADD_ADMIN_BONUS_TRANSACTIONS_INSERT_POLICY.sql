-- ============================================
-- Миграция 018: Добавление политики INSERT для админов в bonus_transactions
-- ============================================

-- Админы могут создавать бонусные транзакции для любых пользователей
CREATE POLICY "Admins can insert bonus transactions"
  ON bonus_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Админы могут обновлять бонусные счета
-- (дополнение к существующей политике UPDATE)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_bonuses' 
    AND policyname = 'Admins can update all bonus accounts'
  ) THEN
    CREATE POLICY "Admins can update all bonus accounts"
      ON user_bonuses FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

COMMENT ON POLICY "Admins can insert bonus transactions" ON bonus_transactions IS 
  'Админы могут создавать бонусные транзакции для ручных корректировок';

