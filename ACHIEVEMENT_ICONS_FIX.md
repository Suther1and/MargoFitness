# Решение проблемы с кастомными иконками достижений

## Проблема
Кастомные иконки (PNG) отображаются в попапе достижений, но не отображаются в виджете "Последние достижения".

## Причина
Возможные причины:
1. Миграция `030_ADD_ACHIEVEMENT_ICON_URL.sql` не была применена к базе данных
2. В базе данных поле `icon_url` имеет значение `NULL` для нужных достижений
3. Кэш React Query содержит старые данные

## Решение

### Шаг 1: Проверка данных
Откройте страницу `/debug-achievements` в браузере и проверьте:
- Есть ли у достижений "Первый шаг", "Первая отметка", "Постоянство" поле `icon_url`
- Если `icon_url` = `NULL` - нужно применить миграцию к базе

### Шаг 2: Исправление базы данных
Если `icon_url = NULL`:

1. Откройте Supabase Dashboard -> SQL Editor
2. Скопируйте содержимое файла `FIX_ACHIEVEMENT_ICONS.sql`
3. Выполните SQL запросы
4. Проверьте, что `icon_url` установлен правильно

### Шаг 3: Очистка кэша
После исправления базы данных:

1. Откройте DevTools (F12)
2. Перейдите на вкладку Application -> Storage
3. Нажмите "Clear site data" или просто сделайте Hard Refresh (Ctrl+Shift+R)
4. Либо просто подождите 2 минуты (время кэширования)

### Шаг 4: Проверка
1. Откройте страницу `/dashboard/health-tracker`
2. Проверьте виджет "Достижения"
3. Кастомные иконки должны отображаться

## Технические детали

### Что было сделано:
1. Добавлена миграция `031_FIX_ACHIEVEMENT_ICONS.sql` (улучшенная версия)
2. Создана debug-страница `/debug-achievements` для проверки данных
3. Обновлен queryKey в `use-achievements.ts` для инвалидации кэша
4. Добавлены console.log для отладки

### Файлы изменены:
- `app/dashboard/health-tracker/hooks/use-achievements.ts` - добавлен 'v2' в queryKey
- `app/dashboard/health-tracker/components/achievements-card.tsx` - добавлен debug log
- `database/migrations/031_FIX_ACHIEVEMENT_ICONS.sql` - новая миграция
- `FIX_ACHIEVEMENT_ICONS.sql` - SQL для ручного исправления
- `app/debug-achievements/page.tsx` - страница для отладки

### Код виджета правильный
Код в `achievements-card.tsx` (строки 119-130) уже корректно проверяет наличие `icon_url`:

```typescript
{achievement.icon_url ? (
  <img 
    src={achievement.icon_url} 
    alt={achievement.title}
    className="w-full h-full object-contain"
  />
) : (
  <span className="text-3xl">
    {achievement.icon}
  </span>
)}
```

Проблема НЕ в коде, а в данных базы или кэше.
