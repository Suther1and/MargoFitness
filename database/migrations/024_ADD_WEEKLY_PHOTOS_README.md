# Миграция 024: Недельная система фотоотчетов

## Описание
Эта миграция добавляет поддержку недельной системы фотоотчетов с тремя типами поз:
- **Front** (Профиль) - вид спереди
- **Side** (Бок) - вид сбоку  
- **Back** (Спина) - вид сзади

Пользователь может загружать максимум 3 фото в неделю (по одному на каждую позу).

## Изменения в БД

### Новая колонка
- `diary_entries.weekly_photos` (JSONB) - хранит недельные наборы фото

### Структура данных
```json
{
  "week_key": "2026-01-06",
  "photos": {
    "front": {
      "url": "https://...",
      "type": "front",
      "uploaded_at": "2026-01-06T10:00:00Z"
    },
    "side": {
      "url": "https://...",
      "type": "side", 
      "uploaded_at": "2026-01-06T10:05:00Z"
    },
    "back": {
      "url": "https://...",
      "type": "back",
      "uploaded_at": "2026-01-06T10:10:00Z"
    }
  }
}
```

## Как запустить миграцию

### Вариант 1: Через Supabase Dashboard (рекомендуется)
1. Откройте ваш проект в [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в SQL Editor
3. Скопируйте содержимое файла `024_ADD_WEEKLY_PHOTOS.sql`
4. Вставьте в редактор и нажмите **Run**

### Вариант 2: Через Supabase CLI
```bash
# Если у вас установлен Supabase CLI
supabase db push

# Или напрямую через psql
psql -h db.your-project.supabase.co -U postgres -d postgres -f database/migrations/024_ADD_WEEKLY_PHOTOS.sql
```

## Проверка успешности миграции

После запуска миграции выполните следующий SQL запрос для проверки:

```sql
-- Проверка наличия колонки
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diary_entries' 
  AND column_name = 'weekly_photos';

-- Проверка индекса
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'diary_entries' 
  AND indexname = 'idx_diary_entries_weekly_photos';
```

Должно вернуть:
- Колонка `weekly_photos` с типом `jsonb`
- Индекс `idx_diary_entries_weekly_photos`

## Обратная совместимость
- Старая колонка `photo_urls` **не удаляется**
- Существующие фото автоматически мигрируются в `weekly_photos` как тип `front`
- Новый код использует только `weekly_photos`

## Откат миграции (если нужно)

```sql
-- Удалить индекс
DROP INDEX IF EXISTS public.idx_diary_entries_weekly_photos;

-- Удалить колонку
ALTER TABLE public.diary_entries DROP COLUMN IF EXISTS weekly_photos;
```

## Что дальше?

После успешного запуска миграции:
1. ✅ Перезапустите dev сервер (`npm run dev`)
2. ✅ Очистите кэш браузера (Ctrl+Shift+R)
3. ✅ Проверьте загрузку фото в приложении

## Troubleshooting

### Ошибка: "column already exists"
Это нормально - значит колонка уже создана. Миграция использует `IF NOT EXISTS`.

### Ошибка: "permission denied"
Убедитесь что вы подключены под пользователем с правами администратора БД.

### Ошибка при загрузке фото после миграции
1. Проверьте что колонка создана (см. выше)
2. Перезапустите сервер
3. Проверьте в Supabase Dashboard что RLS политики не блокируют доступ
