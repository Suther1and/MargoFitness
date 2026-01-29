-- Добавление новых полей в библиотеку упражнений
ALTER TABLE public.exercise_library 
ADD COLUMN IF NOT EXISTS default_sets INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS default_reps TEXT DEFAULT '12-15',
ADD COLUMN IF NOT EXISTS default_rest_seconds INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS technique_steps TEXT,
ADD COLUMN IF NOT EXISTS typical_mistakes TEXT,
ADD COLUMN IF NOT EXISTS video_script TEXT,
ADD COLUMN IF NOT EXISTS inventory TEXT,
ADD COLUMN IF NOT EXISTS inventory_alternative TEXT,
ADD COLUMN IF NOT EXISTS light_version TEXT;
