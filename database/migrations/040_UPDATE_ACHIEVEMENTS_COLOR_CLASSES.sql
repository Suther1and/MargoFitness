-- Миграция для обновления color_class всех достижений на основе анализа цветов их иконок

-- 1. Золотые / Янтарные (Amber/Gold)
UPDATE achievements SET color_class = 'text-amber-500' WHERE title IN ('Легенда', 'Гуру', 'Идеальный месяц', 'Идеальный день', 'Месяц дисциплины', 'Наставник', 'Железная воля', 'Гигашаги', 'Цель достигнута!', 'Хозяин своей жизни', 'Начало пути', 'Привычный режим');
UPDATE achievements SET color_class = 'text-amber-400' WHERE title IN ('Палитра привычек');
UPDATE achievements SET color_class = 'text-amber-600' WHERE title IN ('Уверенный старт', 'Новичок');

-- 2. Зеленые / Изумрудные (Emerald/Green)
UPDATE achievements SET color_class = 'text-emerald-500' WHERE title IN ('Первый шаг', 'Стопроцентник', 'Месяц контроля', 'Марафонец', 'Игра в долгую');

-- 3. Синие / Голубые / Небесные (Blue/Sky/Cyan)
UPDATE achievements SET color_class = 'text-blue-500' WHERE title IN ('Водохлёб', 'Контроль', 'Паспорт здоровья');
UPDATE achievements SET color_class = 'text-sky-500' WHERE title IN ('Первая отметка', 'В команде');
UPDATE achievements SET color_class = 'text-cyan-500' WHERE title IN ('Океан', 'Постоянство');
UPDATE achievements SET color_class = 'text-cyan-400' WHERE title IN ('Гидратор');

-- 4. Фиолетовые / Пурпурные / Индиго (Purple/Indigo)
UPDATE achievements SET color_class = 'text-purple-500' WHERE title IN ('Высшая лига', 'Мастер спорта', 'Перфекционист', 'Неделя сна', 'Стабильность', 'Коллекционер');
UPDATE achievements SET color_class = 'text-purple-400' WHERE title IN ('Сонный король');
UPDATE achievements SET color_class = 'text-indigo-500' WHERE title IN ('Ночная сова');
UPDATE achievements SET color_class = 'text-indigo-400' WHERE title IN ('Ментор');

-- 5. Оранжевые / Красные (Orange/Red)
UPDATE achievements SET color_class = 'text-orange-500' WHERE title IN ('Неделя силы', 'Атлет', 'Первая тренировка', 'Две недели', 'Ультрамарафон', 'Ветеран', 'Недельный цикл');

-- 6. Розовые (Rose/Pink)
UPDATE achievements SET color_class = 'text-rose-500' WHERE title IN ('Теплый прием');
UPDATE achievements SET color_class = 'text-rose-400' WHERE title IN ('Радость жизни');

-- 7. Серебряные (Slate/Silver)
UPDATE achievements SET color_class = 'text-slate-400' WHERE title IN ('Любитель', 'Продвинутый клуб');

-- 8. Желтые (Yellow)
UPDATE achievements SET color_class = 'text-yellow-400' WHERE title IN ('Энергетик', 'Мастер');
