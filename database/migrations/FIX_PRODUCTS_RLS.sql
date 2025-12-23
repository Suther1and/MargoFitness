-- ============================================
-- Проверка и исправление RLS для products
-- ============================================

-- Проверим текущие политики для products
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products';

-- Если RLS включен для products, но нет политики для чтения -
-- добавим политику что ВСЕ могут читать активные продукты

-- Включить RLS (если еще не включен)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Удалить старую политику если есть
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

-- Создать новую политику: все могут читать активные продукты
CREATE POLICY "Anyone can view active products"
  ON products
  FOR SELECT
  USING (is_active = true);

-- Админы могут видеть все продукты (включая неактивные)
CREATE POLICY "Admins can view all products"
  ON products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR is_active = true
  );

-- Проверка: показать все политики для products
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'products';

