-- ============================================
-- Миграция 047: Исправление ограничений истории покупок
-- ============================================
-- Удаляет уникальное ограничение (user_id, product_id) из таблицы user_purchases,
-- так как пользователь может покупать один и тот же продукт несколько раз (например, продление).
-- ============================================

DO $$ 
DECLARE 
  constraint_name text;
BEGIN
  -- Находим имя уникального ограничения для user_id и product_id
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'user_purchases'::regclass
    AND contype = 'u'
    AND conkey = (
      SELECT array_agg(attnum)
      FROM pg_attribute
      WHERE attrelid = 'user_purchases'::regclass
        AND attname IN ('user_id', 'product_id')
    );

  -- Если нашли, удаляем его
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE user_purchases DROP CONSTRAINT ' || quote_ident(constraint_name);
    RAISE NOTICE 'Успешно удалено ограничение: %', constraint_name;
  ELSE
    -- Попробуем найти по имени по умолчанию, если первый способ не сработал
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'user_purchases'::regclass
      AND conname = 'user_purchases_user_id_product_id_key';
      
    IF constraint_name IS NOT NULL THEN
      EXECUTE 'ALTER TABLE user_purchases DROP CONSTRAINT ' || quote_ident(constraint_name);
      RAISE NOTICE 'Успешно удалено ограничение по имени: %', constraint_name;
    ELSE
      RAISE NOTICE 'Уникальное ограничение не найдено, возможно, оно уже удалено.';
    END IF;
  END IF;
END $$;
