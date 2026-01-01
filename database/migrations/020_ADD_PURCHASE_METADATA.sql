-- ============================================
-- Миграция 020: Добавление metadata покупок
-- ============================================
-- Добавляет поля для хранения фактически уплаченной суммы
-- и количества купленных дней для расчета конвертации при апгрейде
-- ============================================

-- Добавить новые колонки в user_purchases
ALTER TABLE user_purchases 
ADD COLUMN IF NOT EXISTS actual_paid_amount integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_days integer NOT NULL DEFAULT 0;

-- Комментарии для документации
COMMENT ON COLUMN user_purchases.actual_paid_amount IS 'Фактически уплаченная сумма после всех скидок (промокоды, бонусы)';
COMMENT ON COLUMN user_purchases.purchased_days IS 'Количество купленных дней (duration_months * 30)';

-- Обновить существующие записи (если есть)
-- Для старых покупок используем amount как actual_paid_amount
UPDATE user_purchases 
SET 
  actual_paid_amount = amount,
  purchased_days = 30  -- По умолчанию 1 месяц для старых записей
WHERE actual_paid_amount = 0;

