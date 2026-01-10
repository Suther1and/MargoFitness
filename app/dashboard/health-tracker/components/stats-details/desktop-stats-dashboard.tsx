"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Scale, Droplets, Footprints, Camera, 
  Smile, Utensils, Flame, Moon, Coffee,
  BarChart3, ChevronLeft, ChevronRight
} from "lucide-react"
import { format, startOfMonth, startOfWeek, addDays, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, subDays, subYears, differenceInDays } from "date-fns"
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
      return <StatsPhotos dateRange={currentDateRange} userId={userId} />
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
      <div className="grid grid-cols-24 gap-6">
        {/* Основной контент - занимает 8.5 колонок (17 из 24) */}
        <div className="col-span-17">
          {renderStatsContent()}
        </div>

        {/* Календарь выбора периода - занимает 3 колонки (6 из 24), начинается с позиции 19 */}
        <div className="col-span-6 col-start-19">
          <div className="flex gap-6">
            {/* Вертикальный разделитель */}
            <div className="relative self-stretch flex items-center">
              <div className="w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              <div className="absolute inset-0 w-px bg-gradient-to-b from-transparent via-sky-500/5 to-transparent blur-sm" />
            </div>
            
            <div className="flex-1 space-y-8">
              {/* Информация о периоде */}
              <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" 
                />
                <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">Период анализа</span>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-black text-white tracking-tighter leading-none">
                  {format(currentDateRange.start, 'd MMM', { locale: ru })} 
                  <span className="mx-1.5 text-white/10">—</span> 
                  {format(currentDateRange.end, 'd MMM', { locale: ru })}
                </div>
                <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span>{differenceInDays(currentDateRange.end, currentDateRange.start) + 1} дней выбрано</span>
                </div>
              </div>
            </div>

            {/* Контейнер календаря */}
            <div className="p-3 rounded-[2rem] bg-black/20 border border-white/5 backdrop-blur-md relative overflow-hidden group">
              {/* Едва заметный внутренний градиент */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <StatsSidebarCalendar 
                  currentPeriodType={currentPeriodType}
                  currentDateRange={currentDateRange}
                  onPeriodSelect={onPeriodSelect}
                />
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsSidebarCalendar({ 
  currentPeriodType, 
  currentDateRange,
  onPeriodSelect
}: { 
  currentPeriodType: PeriodType,
  currentDateRange: DateRange,
  onPeriodSelect: (periodType: PeriodType, dateRange: DateRange) => void
}) {
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState<Date | null>(currentDateRange.start)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(currentDateRange.end)

  useEffect(() => {
    setSelectedStart(currentDateRange.start)
    setSelectedEnd(currentDateRange.end)
    setViewDate(currentDateRange.end)
  }, [currentDateRange])

  const monthStart = startOfMonth(viewDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const monthDays = eachDayOfInterval({ start: calendarStart, end: addDays(calendarStart, 41) })

  const PERIOD_BUTTONS = [
    { id: '7d' as PeriodType, label: '7д' },
    { id: '30d' as PeriodType, label: '30д' },
    { id: '6m' as PeriodType, label: '6м' },
    { id: '1y' as PeriodType, label: '1г' },
  ]

  const handlePeriodClick = (periodId: PeriodType) => {
    const today = new Date()
    let start: Date
    let end: Date = today

    switch (periodId) {
      case '7d': start = subDays(today, 6); break
      case '30d': start = subDays(today, 29); break
      case '6m': start = subMonths(today, 6); break
      case '1y': start = subYears(today, 1); break
      default: return
    }
    onPeriodSelect(periodId, { start, end })
  }

  const handleDayClick = (day: Date) => {
    if (!selectedStart || selectedEnd) {
      setSelectedStart(day)
      setSelectedEnd(null)
    } else {
      const start = day < selectedStart ? day : selectedStart
      const end = day < selectedStart ? selectedStart : day
      setSelectedStart(start)
      setSelectedEnd(end)
      onPeriodSelect('custom', { start, end })
    }
  }

  return (
    <div className="w-full">
      <div className="space-y-5">
        {/* Кнопки быстрого выбора */}
        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/5">
          {PERIOD_BUTTONS.map((period) => (
            <button
              key={period.id}
              onClick={() => handlePeriodClick(period.id)}
              className={cn(
                "relative flex-1 px-1 py-2 text-[10px] font-black uppercase tracking-wider transition-colors duration-200 rounded-lg",
                currentPeriodType === period.id ? "text-black" : "text-white/40 hover:text-white/60"
              )}
            >
              {currentPeriodType === period.id && (
                <motion.div
                  layoutId="activePeriodPickerSidebar"
                  className="absolute inset-0 bg-sky-500 rounded-lg shadow-lg shadow-sky-500/30"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{period.label}</span>
            </button>
          ))}
        </div>

        {/* Навигация по месяцам */}
        <div className="flex items-center justify-between px-1">
          <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft className="w-4 h-4 text-white/40" />
          </button>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
            {format(viewDate, 'LLLL yyyy', { locale: ru })}
          </span>
          <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors">
            <ChevronRight className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {/* Сетка календаря */}
        <div className="grid grid-cols-7 gap-1">
          {['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map((d) => (
            <div key={d} className="text-[9px] font-black text-white/20 text-center uppercase pb-1 tracking-widest">{d}</div>
          ))}
          {monthDays.map((day, idx) => {
            const isStart = selectedStart && isSameDay(day, selectedStart)
            const isEnd = selectedEnd && isSameDay(day, selectedEnd)
            const inRange = selectedStart && selectedEnd && day > selectedStart && day < selectedEnd
            const isCurrentMonth = isSameMonth(day, viewDate)
            const isToday = isSameDay(day, new Date())

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative aspect-square rounded-lg flex items-center justify-center text-[12px] font-black transition-all",
                  (isStart || isEnd) ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20" : 
                  inRange ? "bg-sky-500/20 text-sky-400" : "hover:bg-white/5",
                  !isCurrentMonth && "opacity-20"
                )}
              >
                {format(day, 'd')}
                {!isStart && !isEnd && isToday && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-sky-500/50" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
