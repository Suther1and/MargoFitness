# Фото-прогресс: Реализация и безопасность

## Обзор

Реализован полнофункциональный модуль загрузки и управления фото прогресса с интеграцией веса из дневника здоровья.

## Архитектура

### Хранение данных

- **Storage**: Supabase Storage bucket `progress-photos` (приватный)
- **Metadata**: Поле `photo_urls` (TEXT[]) в таблице `diary_entries`
- **Интеграция**: Вес берется из `diary_entries.metrics.weight` той же даты

**Важно:** Ранее была попытка реализовать через отдельную таблицу `progress_photos`, но она была **удалена** в миграции `022_UPDATE_HEALTH_DIARY.sql`. Текущая реализация использует массив URL в `diary_entries.photo_urls`.

### Компоненты

1. **`use-progress-photos.ts`** - Хук для работы с фото
   - Загрузка фото с автоматическим сжатием
   - Получение всех фото с интеграцией веса
   - Удаление фото с оптимистичными обновлениями

2. **`daily-photos-card.tsx`** - Виджет для загрузки/удаления фото
   - Показывается в дневнике на выбранную дату
   - Drag & drop не реализован (можно добавить позже)
   - Подтверждение перед удалением (2 клика)

3. **`stats-photos.tsx`** - Страница статистики фото
   - Галерея всех фото с весом
   - График изменения веса
   - Фильтрация по диапазону дат

### Backend функции (в `lib/actions/diary.ts`)

- `uploadProgressPhoto(userId, date, formData)` - Загрузка фото
- `getProgressPhotos(userId)` - Получение всех фото с весом
- `deleteProgressPhoto(userId, date, photoUrl)` - Удаление фото

**⚠️ Устаревшие функции в `health-tracker.ts` удалены** - они использовали несуществующую таблицу `progress_photos`.

## Безопасность

### Storage Bucket

✅ **Приватный доступ**
- Bucket настроен как `public: false`
- Файлы доступны только через signed URLs
- Signed URLs действуют 1 год

✅ **RLS Политики**
```sql
-- Пользователь может загружать только в свою папку
auth.uid()::text = (storage.foldername(name))[1]

-- Пользователь видит только свои фото
auth.uid()::text = (storage.foldername(name))[1]

-- Админы видят все фото
role = 'admin'
```

✅ **Структура файлов**
```
progress-photos/
  └── userId/
      ├── 2026-01-09_1736445123456.jpg
      ├── 2026-01-10_1736531523456.jpg
      └── ...
```

### Валидация

✅ **На клиенте**
- Проверка типа файла (image/*)
- Ограничение размера (10MB)
- Сжатие до ~1MB перед загрузкой

✅ **На сервере** (TODO)
- [ ] Добавить проверку MIME-типа на сервере
- [ ] Добавить проверку размера файла на сервере
- [ ] Добавить rate limiting для защиты от спама

### Автоматическое удаление

✅ **Cascade Delete**
```sql
ON DELETE CASCADE
```
При удалении пользователя:
1. Удаляется запись из `profiles`
2. Автоматически удаляются все `diary_entries`
3. Storage файлы нужно удалять отдельно (TODO: trigger)

## Оптимизация

### Сжатие изображений

Используется `browser-image-compression`:
```typescript
{
  maxSizeMB: 1,           // Макс 1MB
  maxWidthOrHeight: 1920, // Макс размер стороны
  useWebWorker: true,     // Web Worker для производительности
  fileType: 'image/jpeg'  // Конвертация в JPEG
}
```

### Кеширование

React Query кеширует фото на 5 минут:
```typescript
staleTime: 1000 * 60 * 5
```

### Оптимистичные обновления

При удалении фото UI обновляется моментально, откат при ошибке.

## Использование

### Загрузка фото

```typescript
const { uploadPhoto, isUploading, uploadProgress } = useProgressPhotos({ userId })

uploadPhoto({ 
  file: File, 
  date: '2026-01-09' 
})
```

### Получение фото

```typescript
const { photos, isLoading } = useProgressPhotos({ userId })

// photos: Array<{
//   id: string
//   date: string (ISO)
//   url: string (signed URL)
//   weight: number | null
// }>
```

### Удаление фото

```typescript
const { deletePhoto, isDeleting } = useProgressPhotos({ userId })

deletePhoto({ 
  date: '2026-01-09',
  url: 'https://...' 
})
```

## Деплой на Vercel

### Необходимые переменные окружения

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Настройка Storage

**Storage bucket должен быть уже настроен в Supabase**. Если его нет:

1. Создать bucket в Supabase Dashboard:
   - Storage → Create bucket
   - Name: `progress-photos`
   - Public: **OFF** (приватный!)
   - File size limit: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/webp

2. Настроить RLS политики для `storage.objects`:

```sql
-- RLS политики
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

3. Протестировать:
   - Загрузить фото через дневник
   - Проверить отображение в статистике
   - Удалить фото

## TODO

### Высокий приоритет
- [ ] Добавить серверную валидацию файлов
- [ ] Реализовать автоматическое удаление файлов из Storage при удалении записи
- [ ] Добавить rate limiting для загрузки фото

### Средний приоритет
- [ ] Добавить просмотр фото в полном размере (lightbox)
- [ ] Добавить возможность сравнения фото (до/после)
- [ ] Добавить заметки к фото
- [ ] Оптимизация: генерация thumbnails

### Низкий приоритет
- [ ] Drag & drop для загрузки
- [ ] Возможность загрузки нескольких фото сразу
- [ ] Экспорт фото в PDF для отчета

## Безопасность: Чеклист перед продакшеном

- [x] Bucket настроен как приватный
- [x] RLS политики для storage.objects
- [x] Валидация на клиенте
- [ ] Валидация на сервере
- [ ] Rate limiting
- [ ] Мониторинг использования Storage
- [ ] Backup стратегия для фото

## Известные ограничения

1. **Signed URLs истекают через 1 год** - нужно периодически обновлять
2. **Нет автоматической очистки** Storage при удалении записи
3. **Нет защиты от дубликатов** - один и тот же файл можно загрузить несколько раз

## Тестирование

### Ручное тестирование

1. Загрузка фото:
   - [x] Загрузить JPEG
   - [x] Загрузить PNG
   - [x] Попытка загрузить не-изображение
   - [x] Попытка загрузить файл >10MB

2. Просмотр:
   - [x] Фото отображается в дневнике
   - [x] Фото отображается в статистике
   - [x] Вес интегрирован правильно

3. Удаление:
   - [x] Удалить фото из дневника
   - [x] Удалить фото из статистики
   - [x] Проверить что файл удален из Storage

## Поддержка

При возникновении проблем проверьте:
1. Bucket создан в Supabase Storage
2. RLS политики применены
3. Signed URLs валидны
4. Browser-image-compression установлен
