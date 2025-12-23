-- ============================================
-- ADMIN USERS PANEL RLS POLICIES
-- ============================================
-- Добавление RLS политик для админ-панели управления пользователями
-- Админы должны иметь доступ к просмотру и редактированию всех профилей
-- ============================================

-- Создаём функцию для проверки админа (работает без рекурсии)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Политика: Админы могут видеть все профили
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Политика: Админы могут редактировать все профили
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- ПРОВЕРКА
-- ============================================
-- После выполнения миграции проверьте:
-- 1. Войдите как админ
-- 2. Откройте /admin/users
-- 3. Убедитесь, что видны все пользователи
-- 4. Попробуйте отредактировать пользователя
-- 5. Войдите как обычный пользователь
-- 6. Убедитесь, что /admin/users недоступна (redirect)
-- ============================================

