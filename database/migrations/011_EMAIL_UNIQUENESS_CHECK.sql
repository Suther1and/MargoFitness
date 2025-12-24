-- ============================================
-- EMAIL UNIQUENESS CHECK FUNCTION
-- ============================================
-- Функция для проверки уникальности email
-- Возвращает true, если email уже используется другим пользователем
-- ============================================

CREATE OR REPLACE FUNCTION check_email_exists(
  email_to_check TEXT,
  current_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE email = email_to_check
    AND id != current_user_id
    AND email NOT LIKE '%@telegram.local'  -- Исключаем технические email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Предоставляем доступ всем аутентифицированным пользователям
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT, UUID) TO authenticated;

-- ============================================
-- КОММЕНТАРИИ
-- ============================================
COMMENT ON FUNCTION check_email_exists IS 'Проверяет, занят ли email другим пользователем (исключая технические @telegram.local)';

