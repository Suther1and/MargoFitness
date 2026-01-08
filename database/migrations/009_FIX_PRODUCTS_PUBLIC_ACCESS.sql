-- =====================================================
-- Миграция: Публичный доступ к продуктам
-- Версия: 009
-- Дата: 2024-12-24
-- Описание: Разрешаем неавторизованным пользователям видеть активные продукты
-- =====================================================

-- Удаляем старую политику (только для authenticated)
DROP POLICY IF EXISTS "Active products viewable by everyone" ON products;

-- Создаем новую политику с доступом для анонимных пользователей
CREATE POLICY "Active products viewable by everyone"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Комментарий
COMMENT ON POLICY "Active products viewable by everyone" ON products IS 
  'Активные продукты доступны для просмотра всем пользователям (включая неавторизованных)';






