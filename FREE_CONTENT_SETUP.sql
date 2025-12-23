-- ============================================
-- FREE CONTENT SETUP
-- ============================================
-- Создание таблицы для бесплатных материалов

-- 1. Создаем таблицу free_content
CREATE TABLE IF NOT EXISTS free_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  video_url TEXT,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Включаем RLS
ALTER TABLE free_content ENABLE ROW LEVEL SECURITY;

-- 3. RLS политики для free_content
-- Все авторизованные пользователи могут читать опубликованный контент
CREATE POLICY "Authenticated users can view published free content"
  ON free_content
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Админы могут делать всё
CREATE POLICY "Admins have full access to free content"
  ON free_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 4. Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_free_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER free_content_updated_at
  BEFORE UPDATE ON free_content
  FOR EACH ROW
  EXECUTE FUNCTION update_free_content_updated_at();

-- 5. Добавляем тестовые бесплатные материалы
INSERT INTO free_content (title, description, content, is_published, order_index) VALUES
  ('Добро пожаловать!', 'Вводное видео о платформе', 'В этом материале вы узнаете, как пользоваться платформой MargoFitness, как правильно выполнять упражнения и отслеживать свой прогресс.', true, 1),
  ('Основы правильной техники', 'Базовые принципы выполнения упражнений', 'Правильная техника - это основа безопасных и эффективных тренировок. В этом уроке мы разберем основные принципы: правильное дыхание, положение тела, амплитуду движений.', true, 2),
  ('Разминка перед тренировкой', 'Комплекс упражнений для разминки', 'Разминка помогает подготовить тело к нагрузкам и снижает риск травм. Мы покажем 5-минутный комплекс упражнений, который можно выполнять перед любой тренировкой.', true, 3);

-- Успешное завершение
SELECT 'FREE_CONTENT_SETUP COMPLETE' AS status;

