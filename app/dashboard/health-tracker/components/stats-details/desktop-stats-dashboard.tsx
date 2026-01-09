"use client"

import { useState } from "react"
import { 
  Scale, Droplets, Footprints, Camera, 
  Smile, Utensils, Flame, Moon, Coffee,
  BarChart3, Calendar, ChevronDown
} from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { StatsView, WidgetId, PeriodType, DateRange, TrackerSettings, Habit } from "../../types"
import { StatsOverall } from "./stats-overall"
import { StatsWater } from "./stats-water"
import { StatsSteps } from "./stats-steps"
import { StatsWeight } from "./stats-weight"
import { StatsSleep } from "./stats-sleep"
import { StatsCaffeine } from "./stats-caffeine"
import { StatsNutrition } from "./stats-nutrition"
import { StatsMood } from "./stats-mood"
import { StatsPhotos } from "./stats-photos"
import { StatsHabits } from "./stats-habits"
import { DailyMetrics } from "../../types"
import { StatsDatePickerDialog } from "../stats-date-picker-dialog"
import { HealthTrackerCard } from "../health-tracker-card"

interface DesktopStatsDashboardProps {
  userId: string | null
  settings: TrackerSettings
  habits: Habit[]
  period: string
  data: DailyMetrics
  onPeriodSelect: (periodType: PeriodType, dateRange: DateRange) => void
  currentPeriodType: PeriodType
  currentDateRange: DateRange
}

const NAV_ITEMS = [
  { id: 'overall', label: 'Обзор', icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'habits', label: 'Привычки', icon: Flame, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'steps', label: 'Шаги', icon: Footprints, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'water', label: 'Вода', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'weight', label: 'Вес', icon: Scale, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'sleep', label: 'Сон', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'caffeine', label: 'Кофеин', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-600/10' },
  { id: 'nutrition', label: 'Питание', icon: Utensils, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { id: 'mood', label: 'Настроение', icon: Smile, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { id: 'photos', label: 'Прогресс', icon: Camera, color: 'text-violet-400', bg: 'bg-violet-400/10' },
]

export function DesktopStatsDashboard({ 
  userId,
  settings,
  habits,
  period, 
  data, 
  onPeriodSelect,
  currentPeriodType,
  currentDateRange
}: DesktopStatsDashboardProps) {
  const [activeView, setActiveView] = useState<StatsView>('overall')
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  
  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.id === 'overall') return true
    if (item.id === 'habits') return habits.length > 0
    return settings.widgets[item.id as WidgetId]?.enabled
  })

  // Условный рендеринг - только активный компонент в DOM
  const renderStatsContent = () => {
    if (activeView === 'overall') {
      return <StatsOverall settings={settings} habits={habits} period={period} layout="grid" data={data} onNavigate={(view) => setActiveView(view)} dateRange={currentDateRange} userId={userId} />
    }
    if (activeView === 'habits') {
      return <StatsHabits dateRange={currentDateRange} userId={userId} habits={habits} />
    }
    if (activeView === 'water') {
      return <StatsWater settings={settings} dateRange={currentDateRange} userId={userId} />
    }
    if (activeView === 'steps') {
      return <StatsSteps settings={settings} dateRange={currentDateRange} userId={userId} />
    }
    if (activeView === 'weight') {
      return <StatsWeight settings={settings} dateRange={currentDateRange} userId={userId} />
    }
    if (activeView === 'caffeine') {
      return <StatsCaffeine settings={settings} dateRange={currentDateRange} userId={userId} />
    }
    if (activeView === 'sleep') {
      return <StatsSleep settings={settings} dateRange={currentDateRange} userId={userId} />
    }
    if (activeView === 'mood') {
      return <StatsMood dateRange={currentDateRange} userId={userId} />
    }
    if (activeView === 'nutrition') {
      return <StatsNutrition settings={settings} dateRange={currentDateRange} userId={userId} />
    }
    if (activeView === 'photos') {
      return <StatsPhotos dateRange={currentDateRange} />
    }
    return null
  }

  return (
    <div className="w-full space-y-6">
      {/* Горизонтальная навигация по категориям - под заголовком */}
      <div className="flex flex-wrap gap-2">
        {visibleItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as StatsView)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 border active:scale-[0.98]",
                isActive 
                  ? "bg-white/[0.08] border-white/10 shadow-lg" 
                  : "bg-transparent border-white/5 hover:bg-white/[0.03] hover:border-white/10"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-lg flex items-center justify-center transition-all",
                item.bg
              )}>
                <item.icon className={cn("w-3.5 h-3.5", item.color)} />
              </div>
              <span className={cn(
                "text-xs font-bold transition-colors",
                isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
              )}>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Grid layout: Контент + Календарь справа */}
      <div className="grid grid-cols-12 gap-6">
        {/* Основной контент - занимает 9 колонок */}
        <div className="col-span-9">
          {renderStatsContent()}
        </div>

        {/* Календарь выбора периода - занимает 3 колонки */}
        <div className="col-span-3">
          <HealthTrackerCard
            className="p-4"
            title="Период"
            subtitle={
              currentPeriodType === '7d' ? '7 дней' :
              currentPeriodType === '30d' ? '30 дней' :
              currentPeriodType === '6m' ? '6 месяцев' :
              currentPeriodType === '1y' ? '1 год' :
              `${format(currentDateRange.start, 'd MMM', { locale: ru })} - ${format(currentDateRange.end, 'd MMM', { locale: ru })}`
            }
            icon={Calendar}
            iconColor="text-sky-500"
            iconBg="bg-sky-500/10"
            rightAction={
              <button onClick={() => setIsCalendarExpanded(!isCalendarExpanded)} className="p-2">
                <motion.div animate={{ rotate: isCalendarExpanded ? 180 : 0 }}>
                  <ChevronDown className="w-4 h-4 text-white/60 hover:text-white/80 transition-colors" />
                </motion.div>
              </button>
            }
          >
            <StatsDatePickerDialog
              isOpen={isCalendarExpanded}
              onClose={() => setIsCalendarExpanded(false)}
              onPeriodSelect={onPeriodSelect}
              currentPeriodType={currentPeriodType}
              currentDateRange={currentDateRange}
              standalone={true}
            />
          </HealthTrackerCard>
        </div>
      </div>
    </div>
  )
}
