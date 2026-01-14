-- Миграция: Добавление подсказок для секретных достижений
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS secret_hint TEXT;

COMMENT ON COLUMN achievements.secret_hint IS 'Подсказка для секретного достижения, когда оно еще не разблокировано';

-- Обновляем существующие секретные достижения базовыми подсказками
UPDATE achievements SET secret_hint = 'Настоящая сила не в рывке, а в бесконечном повторении. Сможешь дойти до трехзначного числа?' WHERE title = 'Железная воля';
UPDATE achievements SET secret_hint = 'Твои ноги могут унести тебя гораздо дальше, чем обычная прогулка. Попробуй испытать предел за один день.' WHERE title = 'Ультрамарафон';
UPDATE achievements SET secret_hint = 'Хозяин своей жизни берет под контроль каждый день, без исключений.' WHERE title = 'Хозяин своей жизни';
UPDATE achievements SET secret_hint = 'Стабильность — признак мастерства. Удерживай результат, когда цель уже достигнута.' WHERE title = 'Стабильность';
UPDATE achievements SET secret_hint = 'Идеальный месяц требует идеальной дисциплины. Каждый день имеет значение.' WHERE title = 'Идеальный месяц';
UPDATE achievements SET secret_hint = 'Легенды не рождаются за день. Они куются год за годом.' WHERE title = 'Легенда';
UPDATE achievements SET secret_hint = 'Мастерство приходит после сотни повторений. Продолжай тренироваться.' WHERE title = 'Мастер спорта';
UPDATE achievements SET secret_hint = 'Луна — твой единственный свидетель. Иногда сон — это роскошь, которую ты себе не позволяешь.' WHERE title = 'Ночная сова';
UPDATE achievements SET secret_hint = 'Гармония во всем: когда все галочки в твоем плане светятся зеленым.' WHERE title = 'Идеальный день';
UPDATE achievements SET secret_hint = 'Перфекционизм в деталях. Неделя без единого пропуска.' WHERE title = 'Перфекционист';
UPDATE achievements SET secret_hint = 'Вода — это жизнь. Будь как вода, будь последовательным целый месяц.' WHERE title = 'Гидратор';
UPDATE achievements SET secret_hint = 'Радость жизни в каждом дне. Удерживай это состояние как можно дольше.' WHERE title = 'Радость жизни';
