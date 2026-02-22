-- Миграция для добавления полей управления статьями в админке

-- 1. Добавляем колонки
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS display_status text DEFAULT 'admins_only',
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_updated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. Переносим данные из старой колонки is_published в новую display_status
-- Если is_published было true, ставим 'all', если false или null - 'admins_only'
UPDATE articles 
SET display_status = CASE 
    WHEN is_published = true THEN 'all' 
    ELSE 'admins_only' 
END
WHERE display_status = 'admins_only';

-- 3. Инициализируем sort_order на основе даты создания (более новые имеют меньший sort_order, чтобы быть выше)
-- Используем ROW_NUMBER() для создания последовательности
WITH OrderedArticles AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
    FROM articles
)
UPDATE articles
SET sort_order = OrderedArticles.row_num
FROM OrderedArticles
WHERE articles.id = OrderedArticles.id;

-- 4. Индекс для быстрой выборки популярных статей
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count DESC);

-- 5. Функция для безопасного инкремента просмотров статьи
CREATE OR REPLACE FUNCTION increment_article_view(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE articles 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Добавляем комментарии к колонкам
COMMENT ON COLUMN articles.display_status IS 'Статус отображения: hidden (скрыта), all (всем), admins_only (только админам)';
COMMENT ON COLUMN articles.sort_order IS 'Порядок сортировки (меньше = выше)';
COMMENT ON COLUMN articles.is_new IS 'Флаг новой статьи';
COMMENT ON COLUMN articles.is_updated IS 'Флаг обновленной статьи';
COMMENT ON COLUMN articles.tags IS 'Массив тегов (до 3 штук)';
COMMENT ON COLUMN articles.view_count IS 'Счетчик просмотров статьи пользователями';
COMMENT ON FUNCTION increment_article_view(UUID) IS 'Увеличивает счетчик просмотров статьи на 1';
