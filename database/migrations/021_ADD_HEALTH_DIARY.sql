-- Создание таблиц для дневника здоровья

-- 1. Таблица настроек дневника
CREATE TABLE IF NOT EXISTS public.diary_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    enabled_metrics TEXT[] DEFAULT ARRAY['weight', 'steps', 'water', 'calories', 'mood']::TEXT[],
    goals JSONB DEFAULT '{}'::JSONB,
    streaks JSONB DEFAULT '{"current": 0, "longest": 0, "last_entry_date": null}'::JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Таблица ежедневных записей
CREATE TABLE IF NOT EXISTS public.diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    metrics JSONB DEFAULT '{}'::JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- 3. Таблица фото прогресса
CREATE TABLE IF NOT EXISTS public.progress_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включение RLS
ALTER TABLE public.diary_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

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

-- Политики для progress_photos
CREATE POLICY "Users can view their own progress photos" 
ON public.progress_photos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress photos" 
ON public.progress_photos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress photos" 
ON public.progress_photos FOR DELETE 
USING (auth.uid() = user_id);

-- Индексы
CREATE INDEX idx_diary_entries_user_date ON public.diary_entries(user_id, date);
CREATE INDEX idx_progress_photos_user_date ON public.progress_photos(user_id, date);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_diary_settings_updated
    BEFORE UPDATE ON public.diary_settings
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_diary_entries_updated
    BEFORE UPDATE ON public.diary_entries
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

