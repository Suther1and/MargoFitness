-- Создание таблицы библиотеки упражнений
CREATE TABLE IF NOT EXISTS public.exercise_library (
    id TEXT PRIMARY KEY, -- Например, '1.1.1'
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    target_muscles TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если они есть
DROP POLICY IF EXISTS "Allow read access for all users" ON public.exercise_library;
DROP POLICY IF EXISTS "Allow all access for admins" ON public.exercise_library;

-- Политики доступа
CREATE POLICY "Allow read access for all users" ON public.exercise_library
    FOR SELECT USING (true);

CREATE POLICY "Allow all access for admins" ON public.exercise_library
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
