import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DiaryEntry } from "@/types/database"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Возвращает название месяца в родительном падеже
 */
export function getMonthGenitiveCase(date: Date): string {
  const monthsGenitive = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря'
  ]
  
  return monthsGenitive[date.getMonth()]
}

/**
 * Расчет "умных" подсказок на основе данных
 */
export function calculateInsights(entries: DiaryEntry[]) {
  const insights = []
  
  if (entries.length < 3) return []

  // Сортируем по дате
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  
  // Пример 1: Прогресс по весу
  const weights = sorted
    .filter(e => (e.metrics as any).weight)
    .map(e => Number((e.metrics as any).weight))
    
  if (weights.length >= 2) {
    const firstWeight = weights[0]
    const lastWeight = weights[weights.length - 1]
    const diff = lastWeight - firstWeight
    
    if (diff < 0) {
      insights.push({
        type: 'weight',
        title: 'Прогресс по весу',
        text: `За последние 14 дней твой вес снизился на ${Math.abs(diff).toFixed(1)} кг. Отличный результат!`,
        color: 'emerald'
      })
    }
  }
  
  // Пример 2: Гидратация
  const waterLogs = sorted.filter(e => (e.metrics as any).water)
  const avgWater = waterLogs.reduce((acc, e) => acc + Number((e.metrics as any).water), 0) / waterLogs.length
  
  if (avgWater < 1.5) {
    insights.push({
      type: 'water',
      title: 'Пей больше воды',
      text: `Твой средний уровень воды ${avgWater.toFixed(1)}л. Попробуй пить хотя бы 2л для лучшего самочувствия.`,
      color: 'blue'
    })
  } else if (avgWater >= 2) {
    insights.push({
      type: 'water',
      title: 'Водный баланс в норме',
      text: `Ты пьешь в среднем ${avgWater.toFixed(1)}л воды. Это помогает твоему метаболизму работать на 100%!`,
      color: 'emerald'
    })
  }

  // Пример 3: Активность (шаги)
  const steps = sorted
    .filter(e => (e.metrics as any).steps)
    .map(e => Number((e.metrics as any).steps))
    
  if (steps.length >= 3) {
    const avgSteps = steps.reduce((acc, s) => acc + s, 0) / steps.length
    if (avgSteps < 5000) {
      insights.push({
        type: 'steps',
        title: 'Больше движения',
        text: `Твоя средняя активность — ${Math.round(avgSteps)} шагов. Даже 15-минутная прогулка добавит тебе энергии!`,
        color: 'orange'
      })
    }
  }

  return insights
}
