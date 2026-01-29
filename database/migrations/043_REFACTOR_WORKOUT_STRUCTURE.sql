-- 1. Создаем новую таблицу для упражнений в тренировках (связующая таблица)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_library_id TEXT NOT NULL REFERENCES public.exercise_library(id),
    
    -- Индивидуальные параметры для конкретной недели/тренировки
    sets INTEGER,
    reps TEXT,
    rest_seconds INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Контент для конкретной недели
    video_kinescope_id TEXT, -- ID видео именно для этой недели
    video_thumbnail_url TEXT,
    video_script TEXT, -- Технический сценарий (скрыт от пользователя)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Добавляем флаг демо-тренировки в workout_sessions
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- 3. Включаем RLS для новой таблицы
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- 4. Политики доступа
DROP POLICY IF EXISTS "Allow read access for all users" ON public.workout_exercises;
CREATE POLICY "Allow read access for all users" ON public.workout_exercises
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all access for admins" ON public.workout_exercises;
CREATE POLICY "Allow all access for admins" ON public.workout_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 5. Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON public.workout_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_library_id ON public.workout_exercises(exercise_library_id);
