-- Миграция 024: Добавление weekly_photos для недельной системы фотоотчетов
-- Эта миграция добавляет поддержку 3 типов фото (front/side/back) с недельной группировкой

-- ============================================
-- Шаг 1: Добавление новой колонки weekly_photos
-- ============================================

-- Добавляем колонку weekly_photos в diary_entries
ALTER TABLE public.diary_entries 
ADD COLUMN IF NOT EXISTS weekly_photos JSONB DEFAULT NULL;

COMMENT ON COLUMN public.diary_entries.weekly_photos IS 'Недельные фото прогресса: {"week_key": "2026-01-06", "photos": {"front": {...}, "side": {...}, "back": {...}}}';

-- ============================================
-- Шаг 2: Миграция существующих данных
-- ============================================

-- Мигрируем существующие фото из photo_urls в weekly_photos
-- Каждое старое фото становится 'front' типом для своей даты (date становится week_key)
UPDATE public.diary_entries
SET weekly_photos = jsonb_build_object(
    'week_key', date::TEXT,
    'photos', (
        SELECT jsonb_object_agg(
            'photo_' || row_number,
            jsonb_build_object(
                'url', photo_url,
                'type', 'front',
                'uploaded_at', created_at::TEXT
            )
        )
        FROM (
            SELECT 
                unnest(photo_urls) as photo_url,
                row_number() OVER () as row_number
            FROM public.diary_entries AS de 
            WHERE de.id = diary_entries.id
        ) AS photos
    )
)
WHERE photo_urls IS NOT NULL 
  AND array_length(photo_urls, 1) > 0
  AND weekly_photos IS NULL;

-- ============================================
-- Шаг 3: Индексы для производительности
-- ============================================

-- GIN индекс для быстрого поиска внутри weekly_photos
CREATE INDEX IF NOT EXISTS idx_diary_entries_weekly_photos 
ON public.diary_entries USING GIN (weekly_photos);

-- ============================================
-- Шаг 4: Примечания и документация
-- ============================================

-- Структура weekly_photos:
-- {
--   "week_key": "2026-01-06",  -- ISO дата понедельника недели
--   "photos": {
--     "front": {
--       "url": "https://...",
--       "type": "front",
--       "uploaded_at": "2026-01-06T10:00:00Z"
--     },
--     "side": {
--       "url": "https://...",
--       "type": "side",
--       "uploaded_at": "2026-01-06T10:05:00Z"
--     },
--     "back": {
--       "url": "https://...",
--       "type": "back",
--       "uploaded_at": "2026-01-06T10:10:00Z"
--     }
--   }
-- }

-- ВАЖНО: 
-- 1. Колонка photo_urls НЕ удаляется для обратной совместимости
-- 2. Новый код использует только weekly_photos
-- 3. week_key должен быть понедельником недели в формате YYYY-MM-DD
-- 4. Каждая неделя (пн-вс) может иметь максимум 3 фото: front, side, back

-- ============================================
-- Готово!
-- ============================================
