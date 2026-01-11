-- Добавление поля goals в diary_settings
-- Это поле используется для дополнительных настроек виджетов
-- Например: {"nutrition": {"goalType": "deficit"}, "weight": 70}

-- Проверяем, существует ли колонка, если нет - добавляем
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'diary_settings' 
        AND column_name = 'goals'
    ) THEN
        ALTER TABLE public.diary_settings 
        ADD COLUMN goals JSONB DEFAULT '{}'::JSONB;
        
        RAISE NOTICE 'Column goals added to diary_settings';
    ELSE
        RAISE NOTICE 'Column goals already exists in diary_settings';
    END IF;
END $$;
