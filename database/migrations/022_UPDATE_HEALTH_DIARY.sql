-- Обновление структуры Health Tracker под актуальный дизайн
-- Эта миграция заменяет устаревшую структуру из 021

-- ============================================
-- Шаг 1: Удаление старых таблиц
-- ============================================

-- Удаляем триггеры
DROP TRIGGER IF EXISTS on_diary_settings_updated ON public.diary_settings;
DROP TRIGGER IF EXISTS on_diary_entries_updated ON public.diary_entries;

-- Удаляем индексы
DROP INDEX IF EXISTS public.idx_diary_entries_user_date;
DROP INDEX IF EXISTS public.idx_progress_photos_user_date;

-- Удаляем таблицы (CASCADE удалит и все политики)
DROP TABLE IF EXISTS public.progress_photos CASCADE;
DROP TABLE IF EXISTS public.diary_entries CASCADE;
DROP TABLE IF EXISTS public.diary_settings CASCADE;

-- ============================================
-- Шаг 2: Создание новых таблиц
-- ============================================

-- 1. Таблица настроек дневника (обновленная структура)
CREATE TABLE public.diary_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Какие виджеты включены
    enabled_widgets TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Цели по каждому виджету (например: {"water": 2500, "steps": 10000})
    widget_goals JSONB DEFAULT '{}'::JSONB,
    
    -- Какие виджеты добавлены в дневной план
    widgets_in_daily_plan TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Параметры пользователя (рост, вес, возраст, пол)
    user_params JSONB DEFAULT '{"height": null, "weight": null, "age": null, "gender": null}'::JSONB,
    
    -- Привычки пользователя (массив объектов с полями: id, title, frequency, time, enabled, streak)
    habits JSONB DEFAULT '[]'::JSONB,
    
    -- Стрики (серии выполнения)
    streaks JSONB DEFAULT '{"current": 0, "longest": 0, "last_entry_date": null}'::JSONB,
    
    -- Дополнительные цели и настройки (например: {"nutrition": {"goalType": "deficit"}, "weight": 70})
    goals JSONB DEFAULT '{}'::JSONB,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Таблица ежедневных записей (обновленная структура)
CREATE TABLE public.diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    
    -- Все метрики дня в JSON (water, steps, weight, sleep, caffeine, calories, foodQuality, mood, energy)
    metrics JSONB DEFAULT '{}'::JSONB NOT NULL,
    
    -- Какие привычки выполнены в этот день (например: {"habit-1": true, "habit-2": false})
    habits_completed JSONB DEFAULT '{}'::JSONB,
    
    -- Текстовые заметки
    notes TEXT,
    
    -- URL фотографий прогресса за день
    photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Один пользователь = одна запись на день
    UNIQUE(user_id, date)
);

COMMENT ON TABLE public.diary_settings IS 'Настройки Health Tracker: включенные виджеты, цели, привычки, параметры пользователя';
COMMENT ON TABLE public.diary_entries IS 'Ежедневные записи Health Tracker: метрики здоровья, выполненные привычки, заметки, фото';

COMMENT ON COLUMN public.diary_settings.enabled_widgets IS 'Массив ID включенных виджетов: water, steps, weight, sleep, caffeine, mood, nutrition, photos, notes';
COMMENT ON COLUMN public.diary_settings.widget_goals IS 'JSONB объект с целями: {"water": 2500, "steps": 10000, "weight": 70}';
COMMENT ON COLUMN public.diary_settings.widgets_in_daily_plan IS 'Массив ID виджетов, добавленных в дневной план';
COMMENT ON COLUMN public.diary_settings.user_params IS 'Параметры: {"height": 170, "weight": 72, "age": 28, "gender": "female"}';
COMMENT ON COLUMN public.diary_settings.habits IS 'Массив объектов привычек с полями: id, title, frequency, time, enabled, streak, createdAt';

COMMENT ON COLUMN public.diary_entries.metrics IS 'JSONB объект с метриками: water, steps, weight, sleep, caffeine, calories, foodQuality, mood, energy';
COMMENT ON COLUMN public.diary_entries.habits_completed IS 'JSONB объект выполнения: {"habit-id-1": true, "habit-id-2": false}';

-- ============================================
-- Шаг 3: Row Level Security (RLS)
-- ============================================

ALTER TABLE public.diary_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Политики для diary_settings
CREATE POLICY "Users can view their own diary settings" 
ON public.diary_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary settings" 
ON public.diary_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diary settings" 
ON public.diary_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Политики для diary_entries
CREATE POLICY "Users can view their own diary entries" 
ON public.diary_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diary entries" 
ON public.diary_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries" 
ON public.diary_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries" 
ON public.diary_entries FOR DELETE 
USING (auth.uid() = user_id);

-- Политики для админа
CREATE POLICY "Admins can view all diary settings"
ON public.diary_settings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can view all diary entries"
ON public.diary_entries FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================
-- Шаг 4: Индексы для производительности
-- ============================================

-- Основной индекс для быстрого поиска записей пользователя по дате
CREATE INDEX idx_diary_entries_user_date ON public.diary_entries(user_id, date DESC);

-- Индекс для поиска последних записей (для расчета стриков)
CREATE INDEX idx_diary_entries_date ON public.diary_entries(date DESC);

-- GIN индекс для быстрого поиска внутри JSONB полей
CREATE INDEX idx_diary_entries_metrics ON public.diary_entries USING GIN (metrics);
CREATE INDEX idx_diary_settings_habits ON public.diary_settings USING GIN (habits);

-- ============================================
-- Шаг 5: Триггеры
-- ============================================

-- Функция для автоматического обновления updated_at уже существует из миграции 021
-- Создаем триггеры заново

CREATE TRIGGER on_diary_settings_updated
    BEFORE UPDATE ON public.diary_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_diary_entries_updated
    BEFORE UPDATE ON public.diary_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Шаг 6: Функция для обновления стриков
-- ============================================

CREATE OR REPLACE FUNCTION public.update_diary_streaks(p_user_id UUID, p_entry_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_last_date DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
BEGIN
    -- Получаем текущие стрики
    SELECT 
        (streaks->>'last_entry_date')::DATE,
        (streaks->>'current')::INTEGER,
        (streaks->>'longest')::INTEGER
    INTO v_last_date, v_current_streak, v_longest_streak
    FROM public.diary_settings
    WHERE user_id = p_user_id;
    
    -- Если настроек нет, создаем их
    IF NOT FOUND THEN
        INSERT INTO public.diary_settings (user_id, streaks)
        VALUES (p_user_id, jsonb_build_object(
            'current', 1,
            'longest', 1,
            'last_entry_date', p_entry_date
        ));
        RETURN;
    END IF;
    
    -- Если это первая запись
    IF v_last_date IS NULL THEN
        UPDATE public.diary_settings
        SET streaks = jsonb_build_object(
            'current', 1,
            'longest', GREATEST(v_longest_streak, 1),
            'last_entry_date', p_entry_date
        )
        WHERE user_id = p_user_id;
        RETURN;
    END IF;
    
    -- Если запись на следующий день - увеличиваем стрик
    IF p_entry_date = v_last_date + 1 THEN
        v_current_streak := v_current_streak + 1;
        v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
    -- Если запись на тот же день - не меняем стрик
    ELSIF p_entry_date = v_last_date THEN
        -- Ничего не делаем
    -- Если пропущен день - обнуляем текущий стрик
    ELSE
        v_current_streak := 1;
    END IF;
    
    -- Обновляем стрики
    UPDATE public.diary_settings
    SET streaks = jsonb_build_object(
        'current', v_current_streak,
        'longest', v_longest_streak,
        'last_entry_date', p_entry_date
    )
    WHERE user_id = p_user_id;
END;
$$;

COMMENT ON FUNCTION public.update_diary_streaks IS 'Автоматически обновляет стрики (серии) ежедневных записей пользователя';

-- ============================================
-- Готово!
-- ============================================

