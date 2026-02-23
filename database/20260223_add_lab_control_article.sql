-- Добавление статьи "Лабораторный контроль" в таблицу articles

INSERT INTO articles (slug, title, description, category, reading_time, access_level, display_status, sort_order, is_new, tags)
VALUES (
  'lab-control',
  'Лабораторный контроль: какие анализы важны для женщины в фитнесе',
  'Какие анализы сдавать, как читать результаты и почему лабораторные нормы — не то же самое, что оптимум. Приборная панель твоего тела.',
  'Биохакинг',
  10,
  'pro',
  'all',
  50,
  true,
  ARRAY['Биохакинг', 'Основы']
);
