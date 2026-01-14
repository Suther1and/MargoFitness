-- ============================================
-- Миграция 032: Обновление icon_url для всех достижений
-- ============================================
-- Эта миграция устанавливает icon_url для всех 36 достижений
-- в соответствии с кастомными 3D glass иконками
-- ============================================

-- ============================================
-- 🔥 СЕРИИ (Streaks)
-- ============================================
UPDATE achievements 
SET icon_url = '/achievements/first-step.png' 
WHERE title = 'Первый шаг';

UPDATE achievements 
SET icon_url = '/achievements/week-strength.png' 
WHERE title = 'Неделя силы';

UPDATE achievements 
SET icon_url = '/achievements/two-weeks.png' 
WHERE title = 'Две недели';

UPDATE achievements 
SET icon_url = '/achievements/month-discipline.png' 
WHERE title = 'Месяц дисциплины';

UPDATE achievements 
SET icon_url = '/achievements/iron-will.png' 
WHERE title = 'Железная воля';

-- ============================================
-- 💧 ВОДА (Metrics - Water)
-- ============================================
UPDATE achievements 
SET icon_url = '/achievements/water-lover.png' 
WHERE title = 'Водохлёб';

UPDATE achievements 
SET icon_url = '/achievements/ocean.png' 
WHERE title = 'Океан';

-- ============================================
-- 🏃 ШАГИ (Metrics - Steps)
-- ============================================
UPDATE achievements 
SET icon_url = '/achievements/marathon.png' 
WHERE title = 'Марафонец';

UPDATE achievements 
SET icon_url = '/achievements/ultra-marathon.png' 
WHERE title = 'Ультрамарафон';

UPDATE achievements 
SET icon_url = '/achievements/giga-steps.png' 
WHERE title = 'Гигашаги';

-- ============================================
-- 😴 СОН (Metrics - Sleep)
-- ============================================
UPDATE achievements 
SET icon_url = '/achievements/sleep-king.png' 
WHERE title = 'Сонный король';

UPDATE achievements 
SET icon_url = '/achievements/sleep-week.png' 
WHERE title = 'Неделя сна';

-- ============================================
-- ✨ ПРИВЫЧКИ (Habits)
-- ============================================
UPDATE achievements 
SET icon_url = '/achievements/habit-start.png' 
WHERE title = 'Начало пути';

UPDATE achievements 
SET icon_url = '/achievements/habit-routine.png' 
WHERE title = 'Привычный режим';

UPDATE achievements 
SET icon_url = '/achievements/life-master.png' 
WHERE title = 'Хозяин своей жизни';

UPDATE achievements 
SET icon_url = '/achievements/collector.png' 
WHERE title = 'Коллекционер';

UPDATE achievements 
SET icon_url = '/achievements/hundred-percent.png' 
WHERE title = 'Стопроцентник';

-- ============================================
-- ⚖️ ВЕС (Weight)
-- ============================================
UPDATE achievements 
SET icon_url = '/achievements/first-mark.png' 
WHERE title = 'Первая отметка';

UPDATE achievements 
SET icon_url = '/achievements/weight-control.png' 
WHERE title = 'Контроль';

UPDATE achievements 
SET icon_url = '/achievements/month-control.png' 
WHERE title = 'Месяц контроля';

UPDATE achievements 
SET icon_url = '/achievements/goal-reached.png' 
WHERE title = 'Цель достигнута!';

UPDATE achievements 
SET icon_url = '/achievements/stability.png' 
WHERE title = 'Стабильность';

-- ============================================
-- 📅 РЕГУЛЯРНОСТЬ (Consistency)
-- ============================================
UPDATE achievements 
SET icon_url = '/achievements/consistency.png' 
WHERE title = 'Постоянство';

UPDATE achievements 
SET icon_url = '/achievements/perfect-month.png' 
WHERE title = 'Идеальный месяц';

UPDATE achievements 
SET icon_url = '/achievements/veteran.png' 
WHERE title = 'Ветеран';

UPDATE achievements 
SET icon_url = '/achievements/legend.png' 
WHERE title = 'Легенда';

-- ============================================
-- 🏋️ ТРЕНИРОВКИ (Workouts)
-- ============================================
UPDATE achievements 
SET icon_url = '/achievements/first-workout.png' 
WHERE title = 'Первая тренировка';

UPDATE achievements 
SET icon_url = '/achievements/weekly-cycle.png' 
WHERE title = 'Недельный цикл';

UPDATE achievements 
SET icon_url = '/achievements/athlete.png' 
WHERE title = 'Атлет';

UPDATE achievements 
SET icon_url = '/achievements/sport-master.png' 
WHERE title = 'Мастер спорта';

-- ============================================
-- 🎯 СПЕЦИАЛЬНЫЕ/СЕКРЕТНЫЕ
-- ============================================
UPDATE achievements 
SET icon_url = '/achievements/night-owl.png' 
WHERE title = 'Ночная сова';

UPDATE achievements 
SET icon_url = '/achievements/perfect-day.png' 
WHERE title = 'Идеальный день';

UPDATE achievements 
SET icon_url = '/achievements/perfectionist.png' 
WHERE title = 'Перфекционист';

UPDATE achievements 
SET icon_url = '/achievements/hydrator.png' 
WHERE title = 'Гидратор';

UPDATE achievements 
SET icon_url = '/achievements/energetic.png' 
WHERE title = 'Энергетик';

UPDATE achievements 
SET icon_url = '/achievements/joy-life.png' 
WHERE title = 'Радость жизни';

-- ============================================
-- Проверка результатов
-- ============================================
DO $$
DECLARE
  total_achievements INT;
  with_icons INT;
  without_icons INT;
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO total_achievements FROM achievements;
  SELECT COUNT(*) INTO with_icons FROM achievements WHERE icon_url IS NOT NULL;
  SELECT COUNT(*) INTO without_icons FROM achievements WHERE icon_url IS NULL;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Статистика обновления иконок достижений:';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Всего достижений: %', total_achievements;
  RAISE NOTICE 'С иконками: %', with_icons;
  RAISE NOTICE 'Без иконок: %', without_icons;
  RAISE NOTICE '============================================';
  
  IF without_icons > 0 THEN
    RAISE NOTICE 'ВНИМАНИЕ: Есть достижения без иконок!';
    RAISE NOTICE 'Список достижений без icon_url:';
    FOR rec IN (SELECT title FROM achievements WHERE icon_url IS NULL ORDER BY title)
    LOOP
      RAISE NOTICE '  - %', rec.title;
    END LOOP;
  ELSE
    RAISE NOTICE 'Успешно! Все достижения имеют иконки.';
  END IF;
  
  RAISE NOTICE '============================================';
END $$;
