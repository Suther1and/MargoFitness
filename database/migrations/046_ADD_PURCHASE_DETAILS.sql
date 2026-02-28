-- ============================================
-- Миграция 046: Добавление детализации покупок
-- ============================================
-- Добавляет поля для хранения информации о промокодах,
-- использованных бонусах и типе операции (покупка/продление/апгрейд)
-- ============================================

-- Создать ENUM для типов операций (если еще не создан)
DO $$ BEGIN
  CREATE TYPE purchase_action AS ENUM ('purchase', 'renewal', 'upgrade');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Добавить новые колонки в user_purchases
ALTER TABLE user_purchases 
ADD COLUMN IF NOT EXISTS action purchase_action DEFAULT 'purchase',
ADD COLUMN IF NOT EXISTS promo_code text,
ADD COLUMN IF NOT EXISTS bonus_amount_used integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Комментарии для документации
COMMENT ON COLUMN user_purchases.action IS 'Тип операции: покупка, продление или апгрейд';
COMMENT ON COLUMN user_purchases.promo_code IS 'Использованный промокод';
COMMENT ON COLUMN user_purchases.bonus_amount_used IS 'Количество использованных бонусных шагов';
COMMENT ON COLUMN user_purchases.metadata IS 'Дополнительные метаданные о покупке (проценты, скидки и т.д.)';

-- Создать индекс для быстрого поиска по типу операции
CREATE INDEX IF NOT EXISTS idx_user_purchases_action ON user_purchases(action);

-- Обновить существующие записи (проверяем metadata в payment_transactions)
-- Сначала обновляем metadata из транзакций
UPDATE user_purchases up
SET metadata = COALESCE(pt.metadata, '{}'::jsonb)
FROM payment_transactions pt
WHERE up.payment_id = pt.yookassa_payment_id
  AND pt.metadata IS NOT NULL
  AND up.metadata = '{}'::jsonb;

-- Затем обновляем поля из metadata (как в user_purchases, так и в payment_transactions)
UPDATE user_purchases up
SET 
  action = COALESCE(
    NULLIF((up.metadata->>'action'), '')::purchase_action,
    NULLIF((pt.metadata->>'action'), '')::purchase_action,
    'purchase'::purchase_action
  ),
  promo_code = COALESCE(
    NULLIF(up.metadata->>'promoCode', ''),
    NULLIF(up.metadata->>'promo_code', ''),
    NULLIF(pt.metadata->>'promoCode', ''),
    NULLIF(pt.metadata->>'promo_code', '')
  ),
  bonus_amount_used = COALESCE(
    (up.metadata->>'bonusUsed')::integer,
    (up.metadata->>'bonus_amount_used')::integer,
    (pt.metadata->>'bonusUsed')::integer,
    (pt.metadata->>'bonus_amount_used')::integer,
    0
  )
FROM payment_transactions pt
WHERE up.payment_id = pt.yookassa_payment_id;

-- ============================================
-- Завершение миграции
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ Миграция 046 успешно завершена!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Добавлено в user_purchases:';
  RAISE NOTICE '  • action (тип операции)';
  RAISE NOTICE '  • promo_code (промокод)';
  RAISE NOTICE '  • bonus_amount_used (использованные бонусы)';
  RAISE NOTICE '  • metadata (дополнительные данные)';
  RAISE NOTICE '';
  RAISE NOTICE 'Готово к использованию! 🎉';
  RAISE NOTICE '================================================';
END $$;
