-- ============================================
-- Создание продуктов-подписок с разными периодами
-- Выполните этот скрипт в Supabase SQL Editor
-- ============================================

-- Удалим старые продукты подписок (если есть)
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

-- Проверка: показать все созданные продукты
SELECT 
  id,
  name,
  price,
  tier_level,
  duration_months,
  discount_percentage,
  is_active
FROM products
WHERE type = 'subscription_tier'
ORDER BY tier_level, duration_months;

