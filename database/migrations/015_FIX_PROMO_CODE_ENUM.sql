-- Миграция 015: Исправление ENUM для промокодов
-- Применяется после 014_FIX_BONUS_TABLES

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Проверяем, нужно ли обновление
  SELECT COUNT(*) INTO v_count
  FROM pg_enum
  WHERE enumtypid = 'promo_discount_type'::regtype
  AND enumlabel IN ('percentage', 'fixed');

  IF v_count > 0 THEN
    RAISE NOTICE 'Обнаружены старые значения ENUM, выполняем миграцию...';
    
    -- 1. Переименовываем старый тип
    ALTER TYPE promo_discount_type RENAME TO promo_discount_type_old;
    
    -- 2. Создаем новый тип с правильными значениями
    CREATE TYPE promo_discount_type AS ENUM (
      'percent',        -- Процентная скидка
      'fixed_amount'    -- Фиксированная сумма
    );
    
    -- 3. Обновляем колонку в таблице
    ALTER TABLE promo_codes 
      ALTER COLUMN discount_type TYPE promo_discount_type 
      USING (
        CASE 
          WHEN discount_type::text = 'percentage' THEN 'percent'::promo_discount_type
          WHEN discount_type::text = 'fixed' THEN 'fixed_amount'::promo_discount_type
          ELSE discount_type::text::promo_discount_type
        END
      );
    
    -- 4. Удаляем старый тип
    DROP TYPE promo_discount_type_old;
    
    RAISE NOTICE '✅ ENUM promo_discount_type успешно обновлен!';
  ELSE
    RAISE NOTICE '✅ ENUM promo_discount_type уже имеет правильные значения';
  END IF;
END $$;

-- Также убедимся, что колонка в базе данных называется правильно
DO $$
BEGIN
  -- Если есть поле applicable_to, переименовываем в applicable_products
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promo_codes' 
    AND column_name = 'applicable_to'
  ) THEN
    ALTER TABLE promo_codes RENAME COLUMN applicable_to TO applicable_products;
    RAISE NOTICE '✅ Колонка applicable_to переименована в applicable_products';
  ELSE
    RAISE NOTICE '✅ Колонка applicable_products уже существует';
  END IF;
  
  -- Убедимся, что created_by существует
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promo_codes' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE promo_codes ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Колонка created_by добавлена';
  END IF;
END $$;

-- Завершение
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ Миграция 015 успешно завершена!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Исправлены:';
  RAISE NOTICE '  • ENUM promo_discount_type';
  RAISE NOTICE '  • Названия колонок в promo_codes';
  RAISE NOTICE '';
  RAISE NOTICE 'Готово! 🎉';
  RAISE NOTICE '================================================';
END $$;

