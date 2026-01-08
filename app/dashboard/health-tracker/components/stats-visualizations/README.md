# Stats Visualizations Components

Профессиональные компоненты визуализации для Health Tracker Dashboard.

## Компоненты

### 1. WeightTrendChart
Smooth line chart для отображения динамики веса за период с area gradient и key points.

**Props:**
- `data: WeightDataPoint[]` - массив данных с датой и значением
- `width?: number` (default: 300)
- `height?: number` (default: 120)
- `showArea?: boolean` (default: true)

### 2. StepsBarChart
Bar chart для шагов с цветовой индикацией достижения цели.

**Props:**
- `data: StepsDataPoint[]` - массив с датой, значением и целью
- `width?: number` (default: 300)
- `height?: number` (default: 120)

### 3. WaterWaveChart
Wave/liquid fill визуализация с анимированной волной.

**Props:**
- `percentage: number` - процент выполнения (0-100)
- `width?: number` (default: 120)
- `height?: number` (default: 120)

### 4. SleepDualChart
Dual-axis график для часов сна и качества сна.

**Props:**
- `data: SleepDataPoint[]` - массив с датой, часами и качеством
- `width?: number` (default: 300)
- `height?: number` (default: 100)

### 5. NutritionRingChart
Ring/donut chart для распределения КБЖУ.

**Props:**
- `data: NutritionData` - объект с белками, жирами, углеводами и total
- `size?: number` (default: 120)

### 6. MoodTimeline
Emoji timeline для отображения динамики настроения.

**Props:**
- `data: MoodDataPoint[]` - массив с датой и mood rating (1-5)
- `width?: number` (default: 300)
- `height?: number` (default: 80)

### 7. EnergyGauge
Radial gauge (спидометр) для уровня энергии.

**Props:**
- `value: number` - значение от 0 до 10
- `size?: number` (default: 120)

### 8. HabitsHeatmap
Календарь-heatmap для отслеживания привычек.

**Props:**
- `data: HabitDay[]` - массив дней с датой, completed флагом и value
- `width?: number` (default: 280)
- `height?: number` (default: 140)
- `columns?: number` (default: 7)

### 9. ChartSkeleton
Loading состояние для графиков.

**Props:**
- `width?: number` (default: 300)
- `height?: number` (default: 120)
- `type?: 'line' | 'bar' | 'circle'` (default: 'line')

## Использование

```tsx
import { WeightTrendChart, StepsBarChart } from './stats-visualizations'

// Weight trend
<WeightTrendChart 
  data={[
    { date: '01.01', value: 74.2 },
    { date: '05.01', value: 73.9 }
  ]} 
  width={400} 
  height={100} 
/>

// Steps bar chart
<StepsBarChart 
  data={[
    { date: '1', value: 8200, goal: 10000 },
    { date: '2', value: 12400, goal: 10000 }
  ]} 
/>
```

## Анимации

Все компоненты используют framer-motion для плавных анимаций:
- Path drawing (line charts)
- Stagger animations (bars, points)
- Fade in/scale (interactive elements)
- Continuous animations (waves, gauges)

## Стиль

Все компоненты следуют темному стилю трекера:
- Темный фон (#09090b, #121214)
- Цветные акценты для каждой метрики
- Градиенты и glow эффекты
- Rounded corners (xl, 2xl)



