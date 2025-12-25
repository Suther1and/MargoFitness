-- ============================================
-- Migration 016: Add 'renewal' to payment_type
-- ============================================
-- Добавляет новый тип платежа 'renewal' для продления подписок
-- Это позволяет отличать продление от обычной покупки или апгрейда

-- Удалить старое ограничение
ALTER TABLE payment_transactions 
DROP CONSTRAINT IF EXISTS payment_transactions_payment_type_check;

-- Добавить новое ограничение с 'renewal'
ALTER TABLE payment_transactions
ADD CONSTRAINT payment_transactions_payment_type_check 
CHECK (payment_type IN ('initial', 'recurring', 'upgrade', 'one_time', 'renewal'));

-- Комментарий
COMMENT ON COLUMN payment_transactions.payment_type IS 
'Тип платежа: initial (первая покупка), recurring (автопродление), upgrade (апгрейд), one_time (разовая покупка), renewal (продление текущей подписки)';

-- ============================================
-- Verification
-- ============================================
-- Check constraint:
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'payment_transactions'::regclass 
-- AND conname = 'payment_transactions_payment_type_check';

