-- ============================================
-- Миграция 008: Интеграция ЮKassa
-- ============================================
-- Добавляет поддержку рекуррентных платежей,
-- множественных периодов подписки и историю транзакций
-- ============================================

-- ============================================
-- 1. Обновление таблицы products
-- ============================================

-- Добавляем поля для периодов подписки
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS duration_months INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0;

-- Комментарии для новых полей
COMMENT ON COLUMN products.duration_months IS 'Длительность подписки в месяцах (1, 3, 6, 12)';
COMMENT ON COLUMN products.discount_percentage IS 'Процент скидки за длительный период (0, 5, 10, 15)';

-- ============================================
-- 2. Расширение таблицы profiles
-- ============================================

-- Поля для рекуррентных платежей
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS payment_method_id TEXT,
ADD COLUMN IF NOT EXISTS auto_renew_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS subscription_duration_months INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_payment_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_profiles_next_billing_date 
  ON profiles(next_billing_date) 
  WHERE subscription_status = 'active' AND auto_renew_enabled = true;

CREATE INDEX IF NOT EXISTS idx_profiles_payment_method 
  ON profiles(payment_method_id) 
  WHERE payment_method_id IS NOT NULL;

-- Комментарии
COMMENT ON COLUMN profiles.payment_method_id IS 'Токен карты из ЮKassa для автосписания';
COMMENT ON COLUMN profiles.auto_renew_enabled IS 'Включено ли автопродление подписки';
COMMENT ON COLUMN profiles.subscription_duration_months IS 'Период текущей подписки (1, 3, 6, 12 мес)';
COMMENT ON COLUMN profiles.next_billing_date IS 'Дата следующего автоматического списания';
COMMENT ON COLUMN profiles.failed_payment_attempts IS 'Количество неудачных попыток списания';
COMMENT ON COLUMN profiles.last_payment_date IS 'Дата последнего успешного платежа';

-- ============================================
-- 3. Создание таблицы payment_transactions
-- ============================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- ЮKassa данные
  yookassa_payment_id TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'RUB' CHECK (currency IN ('RUB', 'USD', 'EUR')),
  
  -- Статус и тип
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'canceled', 'failed')),
  payment_type TEXT CHECK (payment_type IN ('initial', 'recurring', 'upgrade', 'one_time')),
  
  -- Дополнительная информация
  payment_method_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user 
  ON payment_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status 
  ON payment_transactions(status);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_yookassa 
  ON payment_transactions(yookassa_payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_created 
  ON payment_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_created 
  ON payment_transactions(user_id, created_at DESC);

-- Комментарии
COMMENT ON TABLE payment_transactions IS 'История всех платежных транзакций через ЮKassa';
COMMENT ON COLUMN payment_transactions.yookassa_payment_id IS 'ID платежа в системе ЮKassa';
COMMENT ON COLUMN payment_transactions.payment_type IS 'Тип платежа: первичный, рекуррентный, апгрейд или разовая покупка';
COMMENT ON COLUMN payment_transactions.metadata IS 'Дополнительные данные (конвертация дней, детали апгрейда и т.д.)';

-- ============================================
-- 4. RLS политики для payment_transactions
-- ============================================

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Пользователи видят только свои транзакции
CREATE POLICY "Users can view own transactions"
  ON payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Админы видят все транзакции
CREATE POLICY "Admins can view all transactions"
  ON payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Система может создавать и обновлять транзакции
-- (через service role key в API routes)

-- ============================================
-- 5. Функция автообновления updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_payment_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_transaction_updated_at();

-- ============================================
-- 6. Создание продуктов-подписок
-- ============================================

-- Сначала удалим старые продукты подписок (если есть)
-- чтобы избежать дублей при повторном запуске миграции
DELETE FROM products WHERE type = 'subscription_tier';

-- Basic тариф (tier_level = 1)
INSERT INTO products (type, name, description, price, tier_level, duration_months, discount_percentage, is_active) VALUES
  ('subscription_tier', 'Basic 1 месяц', 'Базовый тариф на 1 месяц', 3999, 1, 1, 0, true),
  ('subscription_tier', 'Basic 3 месяца', 'Базовый тариф на 3 месяца со скидкой 5%', 11397, 1, 3, 5, true),
  ('subscription_tier', 'Basic 6 месяцев', 'Базовый тариф на 6 месяцев со скидкой 10%', 21594, 1, 6, 10, true),
  ('subscription_tier', 'Basic 12 месяцев', 'Базовый тариф на 12 месяцев со скидкой 15%', 40791, 1, 12, 15, true);

-- Pro тариф (tier_level = 2)
INSERT INTO products (type, name, description, price, tier_level, duration_months, discount_percentage, is_active) VALUES
  ('subscription_tier', 'Pro 1 месяц', 'Продвинутый тариф на 1 месяц', 4499, 2, 1, 0, true),
  ('subscription_tier', 'Pro 3 месяца', 'Продвинутый тариф на 3 месяца со скидкой 5%', 12822, 2, 3, 5, true),
  ('subscription_tier', 'Pro 6 месяцев', 'Продвинутый тариф на 6 месяцев со скидкой 10%', 24294, 2, 6, 10, true),
  ('subscription_tier', 'Pro 12 месяцев', 'Продвинутый тариф на 12 месяцев со скидкой 15%', 45891, 2, 12, 15, true);

-- Elite тариф (tier_level = 3)
INSERT INTO products (type, name, description, price, tier_level, duration_months, discount_percentage, is_active) VALUES
  ('subscription_tier', 'Elite 1 месяц', 'Элитный тариф на 1 месяц', 9999, 3, 1, 0, true),
  ('subscription_tier', 'Elite 3 месяца', 'Элитный тариф на 3 месяца со скидкой 5%', 28497, 3, 3, 5, true),
  ('subscription_tier', 'Elite 6 месяцев', 'Элитный тариф на 6 месяцев со скидкой 10%', 53994, 3, 6, 10, true),
  ('subscription_tier', 'Elite 12 месяцев', 'Элитный тариф на 12 месяцев со скидкой 15%', 101991, 3, 12, 15, true);

-- ============================================
-- 7. Функция для получения продукта по тарифу и периоду
-- ============================================

CREATE OR REPLACE FUNCTION get_product_by_tier_and_duration(
  p_tier_level INTEGER,
  p_duration_months INTEGER
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  tier_level INTEGER,
  duration_months INTEGER,
  discount_percentage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.tier_level,
    p.duration_months,
    p.discount_percentage
  FROM products p
  WHERE p.type = 'subscription_tier'
    AND p.tier_level = p_tier_level
    AND p.duration_months = p_duration_months
    AND p.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_product_by_tier_and_duration IS 
  'Находит продукт подписки по уровню тарифа и длительности периода';

-- ============================================
-- 8. Представление для удобного просмотра подписок
-- ============================================

CREATE OR REPLACE VIEW subscription_products_view AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.price,
  p.tier_level,
  CASE p.tier_level
    WHEN 1 THEN 'Basic'
    WHEN 2 THEN 'Pro'
    WHEN 3 THEN 'Elite'
    ELSE 'Unknown'
  END as tier_name,
  p.duration_months,
  p.discount_percentage,
  -- Расчет базовой цены (до скидки)
  ROUND(p.price / (1 - p.discount_percentage::NUMERIC / 100)) as base_price,
  -- Экономия
  ROUND(
    (p.price / (1 - p.discount_percentage::NUMERIC / 100)) - p.price
  ) as savings_amount,
  -- Цена за день
  ROUND(p.price / (p.duration_months * 30)::NUMERIC, 2) as price_per_day,
  p.is_active,
  p.created_at
FROM products p
WHERE p.type = 'subscription_tier'
ORDER BY p.tier_level, p.duration_months;

COMMENT ON VIEW subscription_products_view IS 
  'Удобное представление продуктов подписки с расчетными полями';

-- ============================================
-- 9. Проверка данных
-- ============================================

-- Проверим что создалось 12 продуктов
DO $$
DECLARE
  product_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count
  FROM products
  WHERE type = 'subscription_tier';
  
  IF product_count != 12 THEN
    RAISE EXCEPTION 'Expected 12 subscription products, found %', product_count;
  END IF;
  
  RAISE NOTICE '✅ Successfully created 12 subscription products';
END $$;

-- Проверим что добавились поля в profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'payment_method_id'
  ) THEN
    RAISE EXCEPTION 'Column payment_method_id not added to profiles';
  END IF;
  
  RAISE NOTICE '✅ Successfully added payment fields to profiles';
END $$;

-- Проверим что создалась таблица payment_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'payment_transactions'
  ) THEN
    RAISE EXCEPTION 'Table payment_transactions not created';
  END IF;
  
  RAISE NOTICE '✅ Successfully created payment_transactions table';
END $$;

-- ============================================
-- ЗАВЕРШЕНИЕ МИГРАЦИИ
-- ============================================

-- Выводим итоговую информацию
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ Миграция 008 успешно завершена!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Создано:';
  RAISE NOTICE '  • 6 новых полей в таблице profiles';
  RAISE NOTICE '  • Таблица payment_transactions с RLS';
  RAISE NOTICE '  • 12 продуктов подписки (3 тарифа × 4 периода)';
  RAISE NOTICE '  • Индексы для оптимизации запросов';
  RAISE NOTICE '  • Функции и представления';
  RAISE NOTICE '';
  RAISE NOTICE 'Следующий шаг: установка зависимостей и настройка .env';
  RAISE NOTICE '================================================';
END $$;

