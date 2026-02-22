-- Миграция: добавление уникальных просмотров статей

-- 1. Добавляем колонку unique_view_count в articles
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS unique_view_count INTEGER DEFAULT 0;

COMMENT ON COLUMN articles.unique_view_count IS 'Количество уникальных профилей, просмотревших статью';

-- 2. Таблица для отслеживания: какой пользователь какую статью смотрел
CREATE TABLE IF NOT EXISTS article_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (article_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_user_id    ON article_views(user_id);

-- 3. Включаем RLS
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- Только сервис (SECURITY DEFINER функции) пишет в таблицу
CREATE POLICY "No direct access" ON article_views
  USING (false);

-- 4. Обновляем RPC — теперь принимает опциональный user_id для уникальных просмотров
CREATE OR REPLACE FUNCTION increment_article_view(
  p_article_id UUID,
  p_user_id    UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Всегда увеличиваем общий счётчик
  UPDATE articles
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_article_id;

  -- Если передан пользователь — трекаем уникальный просмотр
  IF p_user_id IS NOT NULL THEN
    INSERT INTO article_views (article_id, user_id)
    VALUES (p_article_id, p_user_id)
    ON CONFLICT (article_id, user_id) DO NOTHING;

    -- FOUND = true, только если строка была реально вставлена (не конфликт)
    IF FOUND THEN
      UPDATE articles
      SET unique_view_count = COALESCE(unique_view_count, 0) + 1
      WHERE id = p_article_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_article_view(UUID, UUID) IS
  'Увеличивает view_count всегда; unique_view_count — только при первом просмотре пользователя';
