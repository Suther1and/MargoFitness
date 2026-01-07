"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  TrendingDown, Scale, Droplets, Footprints, Camera, 
  NotebookText, Smile, Utensils, Flame, Zap, Moon, Coffee,
  ChevronRight, BarChart3, ChevronLeft, Calendar as CalendarIcon, 
  ChevronDown, Check
} from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, subDays, subYears, differenceInDays } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useTrackerSettings } from "../../hooks/use-tracker-settings"
import { useHabits } from "../../hooks/use-habits"
import { StatsView, WidgetId, PeriodType, DateRange } from "../../types"
import { StatsOverall } from "./stats-overall"
import { StatsWater } from "./stats-water"
import { StatsSteps } from "./stats-steps"
import { StatsWeight } from "./stats-weight"
import { StatsSleep } from "./stats-sleep"
import { StatsCaffeine } from "./stats-caffeine"
import { StatsNutrition } from "./stats-nutrition"
import { StatsMood } from "./stats-mood"
import { StatsNotes } from "./stats-notes"
import { StatsPhotos } from "./stats-photos"
import { StatsHabits } from "./stats-habits"
import { DailyMetrics } from "../../types"
import { HealthTrackerCard } from "../health-tracker-card"

interface DesktopStatsDashboardProps {
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
  { id: 'notes', label: 'Заметки', icon: NotebookText, color: 'text-sky-400', bg: 'bg-sky-400/10' },
]

export function DesktopStatsDashboard({ 
  period, 
  data, 
  onPeriodSelect,
  currentPeriodType,
  currentDateRange
}: DesktopStatsDashboardProps) {
  const { settings } = useTrackerSettings()
  const { habits } = useHabits()
  const [activeView, setActiveView] = useState<StatsView>('overall')
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.id === 'overall') return true
    if (item.id === 'habits') return habits.length > 0
    return settings.widgets[item.id as WidgetId]?.enabled
  })

  // Контент для центральной панели
  const renderActiveContent = () => {
    switch (activeView) {
      case 'overall': return <StatsOverall period={period} layout="grid" data={data} onNavigate={(view) => setActiveView(view)} />
      case 'habits': return <StatsHabits period={period} />
      case 'water': return <StatsWater period={period} />
      case 'steps': return <StatsSteps period={period} />
      case 'weight': return <StatsWeight period={period} />
      case 'caffeine': return <StatsCaffeine period={period} />
      case 'sleep': return <StatsSleep period={period} />
      case 'mood': return <StatsMood period={period} />
      case 'nutrition': return <StatsNutrition period={period} />
      case 'photos': return <StatsPhotos period={period} />
      case 'notes': return <StatsNotes period={period} />
      default: return <StatsOverall period={period} layout="grid" data={data} onNavigate={(view) => setActiveView(view)} />
    }
  }

  return (
    <div className="flex gap-10 items-start max-w-[1600px] mx-auto px-4">
      {/* Левая колонка: Навигация (Чистый премиальный дизайн) */}
      <aside className="w-48 shrink-0 sticky top-8 flex flex-col gap-2">
        <div className="px-4 mb-2">
          <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">Категории</span>
        </div>
        
        <div className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as StatsView)}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-2 rounded-2xl transition-all duration-500 group text-left border relative overflow-hidden active:scale-[0.98]",
                  isActive 
                    ? "bg-white/[0.08] border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5)]" 
                    : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 shrink-0 relative z-10",
                  isActive ? "scale-110 shadow-lg" : "group-hover:scale-110",
                  item.bg
                )}>
                  <item.icon className={cn("w-4 h-4", item.color)} />
                </div>
                <span className={cn(
                  "text-[13px] font-bold transition-colors truncate tracking-tight relative z-10",
                  isActive ? "text-white" : "text-white/30 group-hover:text-white/70"
                )}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Центральная колонка: Основной контент */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {renderActiveContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Правая колонка: Календарь + Инсайты (320px) */}
      <aside className="w-[320px] shrink-0 sticky top-8 flex flex-col gap-6">
        <HealthTrackerCard 
          className="p-5" 
          title="Период анализа" 
          subtitle={
            <div className="flex flex-col">
              <span>{format(currentDateRange.start, 'd MMM', { locale: ru }) + ' — ' + format(currentDateRange.end, 'd MMM', { locale: ru })}</span>
              <span className="text-[9px] text-sky-500/60 font-black tracking-widest mt-0.5">
                {differenceInDays(currentDateRange.end, currentDateRange.start)} ДНЕЙ
              </span>
            </div>
          } 
          icon={CalendarIcon} 
          iconColor="text-sky-500" 
          iconBg="bg-sky-500/10"
          rightAction={
            <button onClick={() => setIsCalendarExpanded(!isCalendarExpanded)} className="p-2 -mr-2">
              <motion.div animate={{ rotate: isCalendarExpanded ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                <ChevronDown className="w-5 h-5 text-white/30 hover:text-white/60 transition-colors" />
              </motion.div>
            </button>
          }
        >
          <StatsSidebarCalendar 
            isExpanded={isCalendarExpanded}
            setIsExpanded={setIsCalendarExpanded}
            currentPeriodType={currentPeriodType}
            currentDateRange={currentDateRange}
            onPeriodSelect={onPeriodSelect}
          />
        </HealthTrackerCard>
      </aside>
    </div>
  )
}

function StatsSidebarCalendar({ 
  isExpanded, 
  setIsExpanded,
  currentPeriodType, 
  currentDateRange,
  onPeriodSelect
}: { 
  isExpanded: boolean, 
  setIsExpanded: (val: boolean) => void,
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
    // НЕ закрываем календарь автоматически
  }

  const handleDayClick = (day: Date) => {
    // Если кликнули на галочку (конечную дату) - закрываем календарь
    if (selectedEnd && isSameDay(day, selectedEnd)) {
      onPeriodSelect('custom', { start: selectedStart!, end: selectedEnd })
      setIsExpanded(false)
      return
    }
    
    // Выбор начальной даты
    if (!selectedStart || selectedEnd) {
      setSelectedStart(day)
      setSelectedEnd(null)
    } else {
      // Выбор конечной даты (не закрываем, ждем клика на галочку)
      const start = day < selectedStart ? day : selectedStart
      const end = day < selectedStart ? selectedStart : day
      setSelectedStart(start)
      setSelectedEnd(end)
      onPeriodSelect('custom', { start, end })
    }
  }

  return (
    <div className="w-full">
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-5">
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
                      {isEnd ? <Check className="w-4 h-4" strokeWidth={3.5} /> : format(day, 'd')}
                      {!isStart && !isEnd && isToday && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-sky-500/50" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
