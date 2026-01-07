'use client'

import { CheckCircle2, Circle, Target, ShieldCheck, AlertCircle } from 'lucide-react'
import { DailyMetrics, TrackerSettings, WidgetId, WIDGET_CONFIGS } from '../types'
import { cn } from '@/lib/utils'

interface GoalsSummaryCardProps {
  data: DailyMetrics
  settings: TrackerSettings
  onNavigateToSettings?: () => void
}

type MetricType = 'goal' | 'limit' // goal = достижение, limit = ограничение

interface GoalData {
  label: string
  current: number
  goal: number
  unit: string
  type: MetricType
}

export function GoalsSummaryCard({ data, settings, onNavigateToSettings }: GoalsSummaryCardProps) {
  // Собираем виджеты, которые добавлены в план на день
  const trackedWidgets = Object.entries(settings.widgets)
    .filter(([id, widget]) => widget.inDailyPlan && widget.enabled && id !== 'habits')
    .map(([id]) => id as WidgetId)

  // Маппинг виджетов на их данные
  const getWidgetData = (widgetId: WidgetId): GoalData | null => {
    const config = WIDGET_CONFIGS[widgetId]
    switch (widgetId) {
      case 'water':
        return { 
          label: config.name, 
          current: data.waterIntake, 
          goal: settings.widgets.water.goal || data.waterGoal, 
          unit: 'мл',
          type: 'goal'
        }
      case 'steps':
        return { 
          label: config.name, 
          current: data.steps, 
          goal: settings.widgets.steps.goal || data.stepsGoal, 
          unit: '',
          type: 'goal'
        }
      case 'sleep':
        return { 
          label: config.name, 
          current: data.sleepHours, 
          goal: settings.widgets.sleep.goal || data.sleepGoal, 
          unit: 'ч',
          type: 'goal'
        }
      case 'caffeine':
        return { 
          label: config.name, 
          current: data.caffeineIntake, 
          goal: settings.widgets.caffeine.goal || data.caffeineGoal, 
          unit: 'шт',
          type: 'limit' // Это лимит!
        }
      case 'nutrition':
        return { 
          label: 'Калории', 
          current: data.calories, 
          goal: settings.widgets.nutrition.goal || data.caloriesGoal, 
          unit: 'ккал',
          type: 'limit' // Это лимит!
        }
      case 'weight':
        return { 
          label: config.name, 
          current: data.weight, 
          goal: settings.widgets.weight.goal || data.weightGoal || data.weight, 
          unit: 'кг',
          type: 'goal'
        }
      default:
        return null
    }
  }

  const goals = trackedWidgets
    .map(getWidgetData)
    .filter(Boolean) as GoalData[]

  // Подсчет выполненных целей (зеленых)
  // Для целей: выполнено если достигнута
  // Для лимитов: выполнено если НЕ превышена (может быть меньше или равна)
  const completedCount = goals.filter(g => {
    if (g.type === 'goal') {
      return g.current >= g.goal // Достигнута или превышена
    } else {
      return g.current < g.goal // Строго меньше лимита (не на пределе)
    }
  }).length

  // Пустое состояние, если нет отслеживаемых виджетов
  if (goals.length === 0) {
    return (
      <div className="rounded-[2.5rem] border border-white/5 bg-[#121214]/95 md:bg-[#121214]/40 md:backdrop-blur-xl p-6 hover:border-white/10 transition-colors duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">План на день</h3>
        </div>
        
        <div className="flex flex-col items-center justify-center py-6 px-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            <Target className="w-7 h-7 text-emerald-500/40" />
          </div>
          <p className="text-xs text-white/40 text-center mb-4 leading-relaxed">
            Нажми <Target className="w-3 h-3 inline-block mx-0.5 text-emerald-400" /> рядом с виджетом для добавления в план на день
          </p>
          {onNavigateToSettings && (
            <button 
              onClick={onNavigateToSettings}
              className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              Перейти в настройки
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[2.5rem] border border-white/5 bg-[#121214]/95 md:bg-[#121214]/40 md:backdrop-blur-xl p-6 hover:border-white/10 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">План на день</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
          {completedCount} / {goals.length} выполнено
        </span>
      </div>

      <div className="space-y-3">
        {goals.map((g) => {
          const isLimit = g.type === 'limit'
          
          // Процент выполнения
          const perc = Math.min((g.current / g.goal) * 100, 100)
          
          // Определяем статус для визуализации
          let status: 'success' | 'warning' | 'danger' | 'incomplete'
          
          if (isLimit) {
            // Для лимитов: зеленый если в норме, янтарный на пределе, красный при превышении
            if (g.current > g.goal) {
              status = 'danger' // Превышен
            } else if (perc >= 100) {
              status = 'warning' // На пределе (ровно лимит)
            } else {
              status = 'success' // В пределах нормы
            }
          } else {
            // Для целей: зеленый если достигнуто, серый если нет
            status = g.current >= g.goal ? 'success' : 'incomplete'
          }
          
          // Для подсчета выполненных целей
          const isDone = status === 'success'
          
          return (
            <div key={g.label} className="group/item">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {status === 'danger' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  ) : status === 'warning' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  ) : status === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-white/20" />
                  )}
                  <span className={cn(
                    "text-xs font-bold transition-colors",
                    status === 'danger' ? "text-red-400" :
                    status === 'warning' ? "text-amber-400" :
                    status === 'success' ? "text-white/80" :
                    "text-white/40"
                  )}>
                    {g.label}
                  </span>
                  {isLimit && (
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-wider",
                      status === 'danger' ? "text-red-500/40" :
                      status === 'warning' ? "text-amber-500/40" :
                      "text-emerald-500/30"
                    )}>
                      Лимит
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-sm md:text-[10px] font-bold",
                    status === 'danger' ? "text-red-400/60" :
                    status === 'warning' ? "text-amber-400/60" :
                    status === 'success' ? "text-emerald-400" :
                    "text-white/20"
                  )}>
                    {g.current}
                  </span>
                  {isLimit && (
                    <>
                      <span className="text-xs md:text-[9px] font-medium text-white/10">/</span>
                      <span className="text-xs md:text-[9px] font-medium text-white/10">{g.goal}</span>
                    </>
                  )}
                  <span className="text-[10px] md:text-[8px] font-medium text-white/10">{g.unit}</span>
                </div>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-[width,background-color] duration-1000",
                    status === 'danger' ? "bg-red-500" :
                    status === 'warning' ? "bg-amber-500" :
                    status === 'success' ? "bg-emerald-500" :
                    "bg-white/10"
                  )}
                  style={{ width: `${perc}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

