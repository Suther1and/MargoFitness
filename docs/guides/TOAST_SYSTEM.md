# Toast System Documentation

## Обзор

Универсальная система toast-уведомлений для дашборда MargoFitness. Поддерживает 5 типов уведомлений с автоматической очередью и приоритетами.

## Типы уведомлений

1. **Achievement** - для достижений (высший приоритет)
2. **Success** - успешные операции
3. **Error** - ошибки (7 сек, средний приоритет)
4. **Info** - информационные сообщения
5. **Warning** - предупреждения

## Использование

### Базовая интеграция

```tsx
import { ToastProvider } from '@/contexts/toast-context'
import { ToastContainer } from '@/components/dashboard/universal-toast'

function App() {
  return (
    <ToastProvider>
      <ToastContainer />
      {/* ваш контент */}
    </ToastProvider>
  )
}
```

### Использование в компонентах

```tsx
import { useToast } from '@/contexts/toast-context'

function MyComponent() {
  const { showSuccess, showError, showAchievement, showInfo, showWarning } = useToast()
  
  // Успех
  showSuccess('Сохранено', 'Данные успешно обновлены')
  
  // Ошибка
  showError('Ошибка', 'Не удалось сохранить данные')
  
  // Достижение
  showAchievement(achievementObject)
  
  // Информация
  showInfo('Подсказка', 'Заполните все поля')
  
  // Предупреждение
  showWarning('Внимание', 'Данные могут быть потеряны')
}
```

### Кастомный toast

```tsx
const { showToast } = useToast()

showToast({
  type: 'success',
  title: 'Заголовок',
  message: 'Текст сообщения',
  icon: '🎉', // опционально
  duration: 5000, // опционально, мс
  priority: 1 // опционально (0-2)
})
```

## Особенности

### Очередь
- Максимум 3 тоста одновременно
- Остальные ждут в очереди
- Автоматическая сортировка по приоритету

### Приоритеты
- **2** - Достижения (показываются первыми)
- **1** - Ошибки
- **0** - Остальные (success, info, warning)

### Длительность
- Достижения: 5 секунд
- Ошибки: 7 секунд
- Остальные: 5 секунд

### Позиция
- Справа внизу (`bottom-4 right-4`)
- Компактный размер (max-w-sm = 384px)
- Адаптивный дизайн

## Архитектура

```
ToastProvider (Context)
  ├── Управление состоянием
  ├── Очередь уведомлений
  └── API методы (showSuccess, showError, ...)

ToastContainer (UI)
  └── UniversalToast (компонент)
      ├── Анимации (Framer Motion)
      ├── Стили по типам
      └── Прогресс-бар
```

## Интеграция с достижениями

Достижения автоматически показываются через toast при:
- Загрузке health tracker (проверка при mount)
- Сохранении записи в дневник (фоновая проверка)

```tsx
// Автоматически в AchievementsChecker
const result = await checkAndUnlockAchievements(userId)
if (result.newAchievements?.length > 0) {
  result.newAchievements.forEach(achievement => {
    showAchievement(achievement) // Автоматически с высшим приоритетом
  })
}
```

## Стили по типам

### Achievement
- Градиент: amber/orange/yellow
- Иконка: трофей или кастомный эмодзи
- Эффект: sparkles анимация
- Награда: показывается если есть

### Success
- Градиент: green/emerald/teal
- Иконка: CheckCircle

### Error
- Градиент: red/rose/pink
- Иконка: AlertCircle

### Info
- Градиент: blue/indigo/cyan
- Иконка: Info

### Warning
- Градиент: yellow/amber/orange
- Иконка: AlertTriangle

## API Reference

### useToast()

Возвращает объект с методами:

```typescript
{
  toasts: Toast[]                    // Активные тосты
  showToast: (toast) => void         // Показать кастомный toast
  showAchievement: (achievement) => void  // Показать достижение
  showSuccess: (title, message) => void   // Показать успех
  showError: (title, message) => void     // Показать ошибку
  showInfo: (title, message) => void      // Показать инфо
  showWarning: (title, message) => void   // Показать предупреждение
  dismissToast: (id) => void         // Закрыть конкретный toast
  clearAll: () => void               // Закрыть все
}
```

### Toast Type

```typescript
interface Toast {
  id: string
  type: 'achievement' | 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  icon?: string | ReactNode
  duration?: number
  data?: any
  priority?: number
}
```

## Миграция со старой системы

### Было (AchievementUnlockedToast)
```tsx
const { showAchievement, clearCurrent, currentAchievement } = useAchievementNotifications()

<AchievementUnlockedToast achievement={currentAchievement} onClose={clearCurrent} />
```

### Стало (Universal Toast)
```tsx
const { showAchievement } = useToast()

<ToastProvider>
  <ToastContainer />
  {/* контент */}
</ToastProvider>
```

## Примеры использования

### В форме сохранения
```tsx
const handleSave = async () => {
  try {
    await saveData()
    showSuccess('Готово', 'Изменения сохранены')
  } catch (error) {
    showError('Ошибка', error.message)
  }
}
```

### Валидация
```tsx
if (!email) {
  showWarning('Внимание', 'Укажите email')
  return
}
```

### Информация
```tsx
showInfo('Подсказка', 'Нажмите Enter для сохранения')
```

---

**Версия:** 1.0  
**Дата:** Январь 2026
