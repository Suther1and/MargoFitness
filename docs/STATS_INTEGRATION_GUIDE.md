# Инструкция по подключению реальной статистики Health Tracker

## Текущее состояние
Все компоненты статистики (`app/dashboard/health-tracker/components/stats-details/*`) используют **MOCK данные** и не подключены к реальной базе данных.

## Что нужно сделать

### 1. Понять структуру передачи данных

Компоненты статистики получают:
```typescript
interface StatsComponentProps {
  period: string  // '7d' | '30d' | '6m' | 'year'
}
```

Но **должны получать**:
```typescript
interface StatsComponentProps {
  dateRange: DateRange  // { start: Date, end: Date }
}
```

### 2. Обновить StatsTab

**Файл:** `app/dashboard/health-tracker/components/stats-tab.tsx`

Изменить передачу данных в компоненты:
```typescript
// БЫЛО:
<StatsWater period={getLegacyPeriod()} />

// ДОЛЖНО БЫТЬ:
<StatsWater dateRange={dateRange} />
```

### 3. Создать Actions для получения данных

**Создать файл:** `lib/actions/health-stats.ts`

Функции для получения статистики по периоду:
```typescript
export async function getWaterStats(userId: string, dateRange: DateRange) {
  // Получить данные воды за период из diary_entries
  // Фильтр: date >= dateRange.start AND date < dateRange.end
  // НЕ включаем конечную дату (сегодняшний день)
}

export async function getStepsStats(userId: string, dateRange: DateRange) {
  // Получить данные шагов за период
}

export async function getWeightStats(userId: string, dateRange: DateRange) {
  // Получить данные веса за период
}

// И так далее для каждой метрики
```

**Важно:** Фильтр должен быть `date >= start AND date < end` чтобы исключить сегодняшний незавершенный день.

### 4. Обновить компоненты статистики

Для каждого компонента (например `stats-water.tsx`):

**Изменить:**
```typescript
// БЫЛО:
interface StatsWaterProps {
  period: string
}

const WATER_DATA = [...] // Моковые данные

export function StatsWater({ period }: StatsWaterProps) {
  // Использование моков
}

// ДОЛЖНО БЫТЬ:
interface StatsWaterProps {
  dateRange: DateRange
}

export function StatsWater({ dateRange }: StatsWaterProps) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const stats = await getWaterStats(userId, dateRange)
      setData(stats)
      setLoading(false)
    }
    loadData()
  }, [dateRange]) // Перезагружать при изменении периода

  if (loading) return <LoadingSpinner />
  if (data.length === 0) return <StatsEmptyState />
  
  // Отображение реальных данных
}
```

### 5. Структура данных в базе

Проверить таблицу `diary_entries` (или создать если нет):

```sql
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  
  -- Метрики
  water_ml INTEGER,
  steps INTEGER,
  weight_kg DECIMAL(5,2),
  sleep_hours DECIMAL(3,1),
  caffeine_cups INTEGER,
  calories INTEGER,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Уникальность: одна запись на пользователя на день
  UNIQUE(user_id, date)
);

-- Индексы для быстрой фильтрации
CREATE INDEX idx_diary_entries_user_date ON diary_entries(user_id, date);
```

### 6. Порядок реализации

1. **Начать с простого виджета** (например, вода)
2. Создать action `getWaterStats`
3. Обновить `stats-water.tsx`
4. Протестировать с реальными данными
5. Повторить для остальных виджетов

### 7. Обработка пустых данных

Использовать существующий компонент:
```typescript
import { StatsEmptyState } from './shared/stats-empty-state'

if (data.length === 0) {
  return <StatsEmptyState message="Нет данных за выбранный период" />
}
```

### 8. Важные моменты

- ⚠️ **Исключить сегодняшний день** из расчетов (день еще не завершен)
- ⚠️ Фильтр: `date >= start AND date < end`
- ⚠️ Кэшировать данные при возможности
- ⚠️ Показывать loading state при загрузке
- ⚠️ Обрабатывать ошибки сети

### 9. Файлы для изменения

```
lib/actions/health-stats.ts                    [СОЗДАТЬ]
app/dashboard/health-tracker/components/stats-tab.tsx  [ИЗМЕНИТЬ]
app/dashboard/health-tracker/components/stats-details/
  ├── stats-water.tsx                          [ИЗМЕНИТЬ]
  ├── stats-steps.tsx                          [ИЗМЕНИТЬ]
  ├── stats-weight.tsx                         [ИЗМЕНИТЬ]
  ├── stats-caffeine.tsx                       [ИЗМЕНИТЬ]
  ├── stats-sleep.tsx                          [ИЗМЕНИТЬ]
  ├── stats-mood.tsx                           [ИЗМЕНИТЬ]
  ├── stats-nutrition.tsx                      [ИЗМЕНИТЬ]
  ├── stats-habits.tsx                         [ИЗМЕНИТЬ]
  ├── stats-notes.tsx                          [ИЗМЕНИТЬ]
  └── stats-photos.tsx                         [ИЗМЕНИТЬ]
```

### 10. Пример полной реализации для воды

```typescript
// lib/actions/health-stats.ts
export async function getWaterStats(dateRange: DateRange) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('diary_entries')
    .select('date, water_ml')
    .eq('user_id', user.id)
    .gte('date', format(dateRange.start, 'yyyy-MM-dd'))
    .lt('date', format(dateRange.end, 'yyyy-MM-dd'))  // Исключаем конечную дату
    .order('date', { ascending: true })
  
  if (error) throw error
  return data
}

// stats-water.tsx
export function StatsWater({ dateRange }: { dateRange: DateRange }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useTrackerSettings()
  
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const stats = await getWaterStats(dateRange)
        setData(stats)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [dateRange])
  
  if (loading) return <div>Загрузка...</div>
  if (data.length === 0) return <StatsEmptyState />
  
  const totalWater = data.reduce((sum, day) => sum + (day.water_ml || 0), 0)
  const avgDaily = Math.round(totalWater / data.length)
  const goal = settings.widgets.water?.goal || 2500
  
  // Остальная логика с реальными данными
}
```

## Готово!

После выполнения всех шагов статистика будет показывать реальные данные пользователя за выбранный период.

